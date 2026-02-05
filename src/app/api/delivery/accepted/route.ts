import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.agentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all accepted orders (not yet delivered) for this agent
        const { data: assignments, error: assignmentError } = await supabase
            .from('order_delivery_assignments')
            .select('order_id, assigned_at')
            .eq('delivery_boy_id', session.agentId);

        if (assignmentError) throw assignmentError;

        if (!assignments || assignments.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        const orderIds = assignments.map(a => a.order_id);

        // Fetch orders with status ACCEPTED_FOR_DELIVERY or OUT_FOR_DELIVERY
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .in('id', orderIds)
            .in('status', ['ACCEPTED_FOR_DELIVERY', 'OUT_FOR_DELIVERY'])
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Get item counts and calculate totals for each order
        const ordersWithItems = await Promise.all(
            (orders || []).map(async (order) => {
                const { data: items } = await supabase
                    .from('order_items')
                    .select('quantity, price_at_purchase')
                    .eq('order_id', order.id);

                const assignment = assignments.find(a => a.order_id === order.id);

                // Calculate total price from items
                const totalPrice = items?.reduce((sum, item) =>
                    sum + (item.price_at_purchase * item.quantity), 0) || 0;

                // Parse address
                let addressStr = 'No address provided';
                if (order.shipping_address) {
                    if (typeof order.shipping_address === 'string') {
                        addressStr = order.shipping_address;
                    } else if (typeof order.shipping_address === 'object') {
                        const { street, city, state, zip, address_line1 } = order.shipping_address;
                        const parts = [street || address_line1, city, state, zip].filter(Boolean);
                        addressStr = parts.length > 0 ? parts.join(', ') : JSON.stringify(order.shipping_address);
                    }
                }

                return {
                    id: order.id,
                    total_price: totalPrice,
                    delivery_address: addressStr,
                    status: order.status,
                    created_at: order.created_at,
                    total_items: items?.length || 0,
                    assigned_at: assignment?.assigned_at
                };
            })
        );

        return NextResponse.json({ orders: ordersWithItems });
    } catch (error: any) {
        console.error('Fetch accepted orders error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch accepted orders' },
            { status: 500 }
        );
    }
}
