
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireDeliverySession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const agentId = await requireDeliverySession();

        // Fetch agent profile
        const { data: agent, error: agentError } = await supabase
            .from('delivery_agents')
            .select('id, name, email, is_active, created_at')
            .eq('id', agentId)
            .single();

        if (agentError || !agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Fetch statistics
        // Total accepted orders
        const { count: totalAccepted } = await supabase
            .from('order_delivery_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('delivery_boy_id', agentId);

        // Delivered orders
        const { count: totalDelivered } = await supabase
            .from('order_delivery_assignments')
            .select('order_id, orders!inner(status)', { count: 'exact', head: true })
            .eq('delivery_boy_id', agentId)
            .eq('orders.status', 'DELIVERED');

        // Active deliveries (accepted or out for delivery)
        const { count: activeDeliveries } = await supabase
            .from('order_delivery_assignments')
            .select('order_id, orders!inner(status)', { count: 'exact', head: true })
            .eq('delivery_boy_id', agentId)
            .in('orders.status', ['ACCEPTED_FOR_DELIVERY', 'OUT_FOR_DELIVERY']);

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
