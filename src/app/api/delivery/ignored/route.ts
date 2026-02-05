import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.agentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all ignored orders for this agent
        const { data: ignoredOrders, error: ignoredError } = await supabase
            .from('ignored_orders')
            .select('order_id, ignored_at')
            .eq('delivery_boy_id', session.agentId)
            .order('ignored_at', { ascending: false });

        if (ignoredError) throw ignoredError;

        if (!ignoredOrders || ignoredOrders.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        const orderIds = ignoredOrders.map(i => i.order_id);

        // Fetch order details
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .in('id', orderIds);

        if (ordersError) throw ordersError;

        // Get item counts and calculate totals for each order
        const ordersWithItems = await Promise.all(
            (orders || []).map(async (order) => {
                const { data: items } = await supabase
                    .from('order_items')
                    .select('quantity, price_at_purchase')
                    .eq('order_id', order.id);

                const ignored = ignoredOrders.find(i => i.order_id === order.id);

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
                    ignored_at: ignored?.ignored_at
                };
            })
        );

        return NextResponse.json({ orders: ordersWithItems });
    } catch (error: any) {
        console.error('Fetch ignored orders error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch ignored orders' },
            { status: 500 }
        );
    }
}
