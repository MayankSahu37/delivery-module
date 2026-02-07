
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!agent) {
            return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 });
        }

        const agentId = agent.id;

        // Fetch all orders assigned to this delivery agent
        // Join with order_delivery_assignments to get only this agent's orders
        const { data: assignments, error: assignError } = await supabase
            .from('order_delivery_assignments')
            .select(`
                id,
                assigned_at,
                order_id,
                orders (
                    id,
                    total_amount,
                    shipping_address,
                    status,
                    created_at,
                    order_items (
                        quantity,
                        price:price_at_purchase
                    )
                )
            `)
            .eq('delivery_boy_id', agentId)
            .order('assigned_at', { ascending: false });

        if (assignError) {
            throw assignError;
        }

        // Process the results
        const processedOrders = (assignments || []).map((assignment: any) => {
            const order = assignment.orders;

            if (!order) return null;

            // Safe address parsing
            let addressStr = 'No address provided';
            if (order.shipping_address) {
                if (typeof order.shipping_address === 'string') {
                    addressStr = order.shipping_address;
                } else if (typeof order.shipping_address === 'object') {
                    const { street, city, state, zip, address_line1 } = order.shipping_address;
                    const parts = [
                        street || address_line1,
                        city,
                        state,
                        zip
                    ].filter(Boolean);

                    if (parts.length > 0) {
                        addressStr = parts.join(', ');
                    } else {
                        addressStr = JSON.stringify(order.shipping_address);
                    }
                }
            }

            return {
                id: order.id,
                total_price: order.total_amount,
                delivery_address: addressStr,
                status: order.status,
                created_at: order.created_at,
                assigned_at: assignment.assigned_at,
                total_items: order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
            };
        }).filter(Boolean); // Remove any null entries

        return NextResponse.json({ orders: processedOrders });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch history error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
