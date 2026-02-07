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

        // Check if user already exists by auth_id
        const { data: existingUserByAuthId } = await supabaseAdmin
            .from('delivery_agents')
            .select('id, email, name, is_active')
            .eq('auth_id', kindeUser.id)
            .maybeSingle();

        if (existingUserByAuthId) {
            return NextResponse.json({
                success: true,
                user: existingUserByAuthId,
                message: 'User already synced'
            });
        }

        // Check if user exists by email (pre-created account)
        const { data: existingUserByEmail } = await supabaseAdmin
            .from('delivery_agents')
            .select('id, email, name, is_active, auth_id')
            .eq('email', kindeUser.email)
            .maybeSingle();

        if (existingUserByEmail) {
            if (existingUserByEmail.auth_id) {
                return NextResponse.json({
                    error: 'Email already linked to another account'
                }, { status: 409 });
            }

            // Link auth_id to existing user
            const { data: linkedUser, error: linkError } = await supabaseAdmin
                .from('delivery_agents')
                .update({ auth_id: kindeUser.id })
                .eq('id', existingUserByEmail.id)
                .select()
                .single();

            if (linkError) {
                return NextResponse.json({ error: linkError.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                user: linkedUser,
                message: 'Account linked successfully!'
            });
        }

        // Create new delivery agent
        const { data: newUser, error: createError } = await supabaseAdmin
            .from('delivery_agents')
            .insert({
                auth_id: kindeUser.id,
                email: kindeUser.email || '',
                name: `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim() || kindeUser.email || 'User',
                is_active: true
            })
            .select()
            .single();

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: newUser,
            message: 'Account created successfully'
        });

    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
