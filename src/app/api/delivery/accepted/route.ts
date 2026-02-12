import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get delivery agent ID from auth_id
        const { data: agent } = await supabase
            .from('delivery_agents')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!agent) {
            return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 });
        }

        // Get orders assigned to this agent from order_delivery_assignments table
        const { data: assignments, error: assignError } = await supabase
            .from('order_delivery_assignments')
            .select('order_id, assigned_at')
            .eq('delivery_boy_id', agent.id)
            .order('assigned_at', { ascending: false });

        if (assignError) throw assignError;

        if (!assignments || assignments.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        const orderIds = assignments.map(a => a.order_id);

        // Fetch order details for all assigned orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                id,
                total_amount,
                shipping_address,
                status,
                created_at,
                order_items (
                    quantity
                )
            `)
            .in('id', orderIds)
            .in('status', ['ASSIGNED', 'ACCEPTED_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'PENDING_DELIVERY', 'pending', 'paid']);

        if (ordersError) throw ordersError;

        if (!orders || orders.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        // Get ignored order IDs for this agent so we can exclude them
        const { data: ignoredData } = await supabase
            .from('ignored_orders')
            .select('order_id')
            .eq('delivery_boy_id', agent.id);

        const ignoredOrderIds = new Set(ignoredData?.map(row => row.order_id) || []);

        // Process and exclude ignored orders
        const processedOrders = orders
            .filter((order: any) => !ignoredOrderIds.has(order.id))
            .map((order: any) => {
                // Safe address parsing
                let addressStr = 'No address provided';
                if (order.shipping_address) {
                    if (typeof order.shipping_address === 'string') {
                        addressStr = order.shipping_address;
                    } else if (typeof order.shipping_address === 'object') {
                        const { street, city, state, zip, address_line1, address } = order.shipping_address;
                        if (address) {
                            addressStr = address;
                        } else {
                            const parts = [street || address_line1, city, state, zip].filter(Boolean);
                            addressStr = parts.length > 0 ? parts.join(', ') : JSON.stringify(order.shipping_address);
                        }
                    }
                }

                const totalItems = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                const assignment = assignments.find(a => a.order_id === order.id);

                return {
                    id: order.id,
                    total_price: order.total_amount,
                    delivery_address: addressStr,
                    status: order.status,
                    created_at: order.created_at,
                    total_items: totalItems,
                    assigned_at: assignment?.assigned_at || order.created_at,
                };
            });

        return NextResponse.json({ orders: processedOrders });

    } catch (error: any) {
        console.error('Fetch accepted orders error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch accepted orders' },
            { status: 500 }
        );
    }
}
