import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const kindeUser = await getUser();

        if (!kindeUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userName = `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim() || kindeUser.email || 'User';
        const userEmail = kindeUser.email || '';

        // ──────────────────────────────────────────────
        // STEP 1: Check delivery_agents by auth_id (RETURNING USER — login)
        // ──────────────────────────────────────────────
        const { data: agentByAuthId } = await supabaseAdmin
            .from('delivery_agents')
            .select('id, email, name, is_active, uid')
            .eq('auth_id', kindeUser.id)
            .maybeSingle();

        if (agentByAuthId) {
            // Returning user — verify role in users table if linked
            if (agentByAuthId.uid) {
                const { data: linkedUser } = await supabaseAdmin
                    .from('users')
                    .select('role')
                    .eq('uid', agentByAuthId.uid)
                    .maybeSingle();

                if (linkedUser && linkedUser.role !== 'delivery_boy') {
                    return NextResponse.json({
                        success: false,
                        unauthorized: true,
                        message: `Your account is registered as "${linkedUser.role}". Only delivery agents can access this portal.`
                    }, { status: 403 });
                }
            }

            return NextResponse.json({
                success: true,
                user: agentByAuthId,
                message: 'User already synced'
            });
        }

        // ──────────────────────────────────────────────
        // STEP 2: Check users table by auth_id
        // ──────────────────────────────────────────────
        const { data: userByAuthId } = await supabaseAdmin
            .from('users')
            .select('uid, email, name, role, is_active, auth_id')
            .eq('auth_id', kindeUser.id)
            .maybeSingle();

        if (userByAuthId) {
            if (userByAuthId.role !== 'delivery_boy') {
                return NextResponse.json({
                    success: false,
                    unauthorized: true,
                    message: `Your account is registered as "${userByAuthId.role}". Only delivery agents can access this portal.`
                }, { status: 403 });
            }

            // User exists with correct role — find or create delivery_agents record
            const { data: agentByUid } = await supabaseAdmin
                .from('delivery_agents')
                .select('id, email, name, is_active')
                .eq('uid', userByAuthId.uid)
                .maybeSingle();

            if (agentByUid) {
                // Ensure auth_id is linked
                await supabaseAdmin
                    .from('delivery_agents')
                    .update({ auth_id: kindeUser.id, profile_image_url: kindeUser.picture || null })
                    .eq('id', agentByUid.id);

                return NextResponse.json({
                    success: true,
                    user: agentByUid,
                    message: 'User already synced'
                });
            }

            // Create delivery_agents record
            const { data: newAgent, error: agentErr } = await supabaseAdmin
                .from('delivery_agents')
                .insert({
                    uid: userByAuthId.uid,
                    auth_id: kindeUser.id,
                    email: userByAuthId.email,
                    name: userByAuthId.name,
                    profile_image_url: kindeUser.picture || null,
                    is_active: true,
                })
                .select()
                .single();

            if (agentErr) {
                console.error('Create delivery agent error:', agentErr);
                return NextResponse.json({ error: agentErr.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                user: newAgent,
                message: 'Account linked successfully!'
            });
        }

        // ──────────────────────────────────────────────
        // STEP 3: Check users table by email
        // ──────────────────────────────────────────────
        const { data: userByEmail } = await supabaseAdmin
            .from('users')
            .select('uid, email, name, role, is_active, auth_id')
            .eq('email', userEmail)
            .maybeSingle();

        if (userByEmail) {
            if (userByEmail.role !== 'delivery_boy') {
                return NextResponse.json({
                    success: false,
                    unauthorized: true,
                    message: `Your account is registered as "${userByEmail.role}". Only delivery agents can access this portal.`
                }, { status: 403 });
            }

            if (userByEmail.auth_id && userByEmail.auth_id !== kindeUser.id) {
                return NextResponse.json({
                    error: 'Email already linked to another account'
                }, { status: 409 });
            }

            // Link auth_id to users record
            if (!userByEmail.auth_id) {
                await supabaseAdmin
                    .from('users')
                    .update({ auth_id: kindeUser.id, profile_image_url: kindeUser.picture || null })
                    .eq('uid', userByEmail.uid);
            }

            // Find delivery_agents by uid or email
            const { data: existingAgent } = await supabaseAdmin
                .from('delivery_agents')
                .select('id, email, name, is_active, auth_id')
                .or(`uid.eq.${userByEmail.uid},email.eq.${userEmail}`)
                .maybeSingle();

            if (existingAgent) {
                // Link auth_id + uid if not set
                await supabaseAdmin
                    .from('delivery_agents')
                    .update({
                        auth_id: kindeUser.id,
                        uid: userByEmail.uid,
                        profile_image_url: kindeUser.picture || null,
                    })
                    .eq('id', existingAgent.id);

                return NextResponse.json({
                    success: true,
                    user: existingAgent,
                    message: 'Account linked successfully!'
                });
            }

            // Create delivery_agents record
            const { data: newAgent, error: newAgentErr } = await supabaseAdmin
                .from('delivery_agents')
                .insert({
                    uid: userByEmail.uid,
                    auth_id: kindeUser.id,
                    email: userEmail,
                    name: userByEmail.name || userName,
                    profile_image_url: kindeUser.picture || null,
                    is_active: true,
                })
                .select()
                .single();

            if (newAgentErr) {
                console.error('Create agent error:', newAgentErr);
                return NextResponse.json({ error: newAgentErr.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                user: newAgent,
                message: 'Account linked successfully!'
            });
        }

        // ──────────────────────────────────────────────
        // STEP 4: Check delivery_agents by email (pre-created by admin, no users record)
        // ──────────────────────────────────────────────
        const { data: preCreatedAgent } = await supabaseAdmin
            .from('delivery_agents')
            .select('id, email, name, is_active, auth_id, uid')
            .eq('email', userEmail)
            .maybeSingle();

        if (preCreatedAgent) {
            if (preCreatedAgent.auth_id && preCreatedAgent.auth_id !== kindeUser.id) {
                return NextResponse.json({
                    error: 'Email already linked to another account'
                }, { status: 409 });
            }

            // Link auth_id to the existing delivery_agents record first
            await supabaseAdmin
                .from('delivery_agents')
                .update({
                    auth_id: kindeUser.id,
                    profile_image_url: kindeUser.picture || null,
                })
                .eq('id', preCreatedAgent.id);

            // Try to create users record — the trigger may try to create a duplicate
            // delivery_agents record, so we handle that error gracefully
            const { data: newUserRecord, error: userCreateErr } = await supabaseAdmin
                .from('users')
                .insert({
                    email: userEmail,
                    name: preCreatedAgent.name || userName,
                    role: 'delivery_boy',
                    auth_id: kindeUser.id,
                    profile_image_url: kindeUser.picture || null,
                    is_verified: true,
                    is_active: true,
                })
                .select()
                .single();

            if (userCreateErr) {
                // The trigger may have caused a conflict — this is expected for pre-created agents.
                // The delivery_agents record is already linked, so this is still a success.
                console.warn('Could not auto-create users record for pre-created agent (trigger conflict):', userCreateErr.message);
            } else if (newUserRecord) {
                // Successfully created users record — link uid to delivery_agents
                await supabaseAdmin
                    .from('delivery_agents')
                    .update({ uid: newUserRecord.uid })
                    .eq('id', preCreatedAgent.id);
            }

            return NextResponse.json({
                success: true,
                user: preCreatedAgent,
                message: 'Account linked successfully!'
            });
        }

        // ──────────────────────────────────────────────
        // STEP 5: Brand new user — create in users table, trigger creates delivery_agents
        // ──────────────────────────────────────────────
        const { data: newUserRecord, error: userInsertErr } = await supabaseAdmin
            .from('users')
            .insert({
                email: userEmail,
                name: userName,
                role: 'delivery_boy',
                auth_id: kindeUser.id,
                profile_image_url: kindeUser.picture || null,
                is_verified: true,
                is_active: true,
            })
            .select()
            .single();

        if (userInsertErr) {
            console.error('Create user error:', userInsertErr);
            return NextResponse.json({ error: userInsertErr.message }, { status: 500 });
        }

        // The trigger should have auto-created a delivery_agents record — find it
        const { data: autoCreatedAgent } = await supabaseAdmin
            .from('delivery_agents')
            .select('id, email, name, is_active')
            .eq('uid', newUserRecord.uid)
            .maybeSingle();

        if (autoCreatedAgent) {
            // Update with auth_id and profile image (trigger may not set these)
            await supabaseAdmin
                .from('delivery_agents')
                .update({
                    auth_id: kindeUser.id,
                    profile_image_url: kindeUser.picture || null,
                })
                .eq('id', autoCreatedAgent.id);

            return NextResponse.json({
                success: true,
                user: autoCreatedAgent,
                message: 'Account created successfully'
            });
        }

        // Trigger didn't create delivery_agents — create manually
        const { data: manualAgent, error: manualAgentErr } = await supabaseAdmin
            .from('delivery_agents')
            .insert({
                uid: newUserRecord.uid,
                auth_id: kindeUser.id,
                email: userEmail,
                name: userName,
                profile_image_url: kindeUser.picture || null,
                is_active: true,
            })
            .select()
            .single();

        if (manualAgentErr) {
            console.error('Create delivery agent error:', manualAgentErr);
            return NextResponse.json({ error: manualAgentErr.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: manualAgent,
            message: 'Account created successfully'
        });

    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
