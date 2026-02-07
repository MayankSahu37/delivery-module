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

        // Get assigned orders directly from the orders table
        // This replaces the query to order_delivery_assignments which was missing data
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                total_amount,
                shipping_address,
                status,
                created_at,
                assigned_at,
                order_items (
                    quantity
                )
            `)
            .eq('assigned_to_delivery_boy_id', agent.id)
            .in('status', ['ASSIGNED', 'ACCEPTED_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'PENDING_DELIVERY'])
            .order('assigned_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!orders || orders.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        // Process result
        const processedOrders = orders.map((order: any) => {
            // Safe address parsing
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

            // Calculate total items
            const totalItems = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

            return {
                id: order.id,
                total_price: order.total_amount,
                delivery_address: addressStr,
                status: order.status,
                created_at: order.created_at,
                total_items: totalItems,
                assigned_at: order.assigned_at || order.created_at // Fallback
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
