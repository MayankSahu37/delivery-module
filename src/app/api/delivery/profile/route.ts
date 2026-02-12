
import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(request: Request) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: agent } = await supabase
            .from('delivery_agents')
            .select('id, name, email, phone, age, address, vehicle_number, profile_image_url, is_active, created_at')
            .eq('auth_id', user.id)
            .single();

        if (!agent) {
            return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 });
        }

        const agentId = agent.id;

        // Fetch statistics
        // Total accepted orders
        const { count: totalAccepted } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to_delivery_boy_id', agentId);

        // Delivered orders
        const { count: totalDelivered } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to_delivery_boy_id', agentId)
            .eq('status', 'DELIVERED');

        // Active deliveries (accepted or out for delivery)
        const { count: activeDeliveries } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to_delivery_boy_id', agentId)
            .in('status', ['ACCEPTED_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'ASSIGNED', 'PENDING_DELIVERY']);

        // Ignored orders count
        const { count: ignoredCount } = await supabase
            .from('ignored_orders')
            .select('*', { count: 'exact', head: true })
            .eq('delivery_boy_id', agentId);

        return NextResponse.json({
            agent: {
                ...agent,
                stats: {
                    totalAccepted: totalAccepted || 0,
                    totalDelivered: totalDelivered || 0,
                    activeDeliveries: activeDeliveries || 0,
                    ignoredCount: ignoredCount || 0
                }
            }
        });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Only allow updating specific fields
        const allowedFields = ['name', 'email', 'phone', 'age', 'address', 'vehicle_number', 'profile_image_url'];
        const updateData: Record<string, any> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Validate age if provided
        if (updateData.age !== undefined && updateData.age !== null) {
            const age = Number(updateData.age);
            if (isNaN(age) || age < 18 || age > 100) {
                return NextResponse.json({ error: 'Age must be between 18 and 100' }, { status: 400 });
            }
            updateData.age = age;
        }

        // Validate phone if provided
        if (updateData.phone !== undefined && updateData.phone !== null && updateData.phone !== '') {
            const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
            if (!phoneRegex.test(updateData.phone)) {
                return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
            }
        }

        const { data: updatedAgent, error: updateError } = await supabaseAdmin
            .from('delivery_agents')
            .update(updateData)
            .eq('auth_id', user.id)
            .select('id, name, email, phone, age, address, vehicle_number, profile_image_url, is_active, created_at')
            .single();

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            agent: updatedAgent,
            message: 'Profile updated successfully'
        });

    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
