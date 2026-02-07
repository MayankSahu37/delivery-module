
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

        // Fetch orders that are PENDING_DELIVERY
        // We need to exclude orders that are already assigned or ignored by this agent

        // 1. Get IDs of orders ignored by this agent
        const { data: ignoredData } = await supabase
            .from('ignored_orders')
            .select('order_id')
            .eq('delivery_boy_id', agentId);

        const ignoredOrderIds = ignoredData?.map(row => row.order_id) || [];

        // 2. Main Query
        // Note: Supabase JS doesn't support complex "NOT IN" or "LEFT JOIN IS NULL" efficiently in one go without raw SQL or RPC depending on structure.
        // However, since we define 'PENDING_DELIVERY' as the status for unassigned orders, we mainly just rely on the status column.
        // If 'ACCEPTED_FOR_DELIVERY' sets the status, we just filter by status='PENDING_DELIVERY'.
        // Then we filter out the ignored ones.

        let query = supabase
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
            .eq('status', 'paid')
            .order('created_at', { ascending: false });

        if (ignoredOrderIds.length > 0) {
            // filter out orders that are in the ignored list
            // .not('id', 'in', `(${ignoredOrderIds.join(',')})`) // Supabase syntax for NOT IN is .not.in() is not standard, it's .not('id', 'in', list)
            query = query.not('id', 'in', `(${ignoredOrderIds.join(',')})`);
        }

        const { data: orders, error } = await query;

        if (error) {
            throw error;
        }

        // Process result to match expectations (calculate total quantity, map fields)
        const processedOrders = orders.map((order: any) => {
            // Safe address parsing
            let addressStr = 'No address provided';
            if (order.shipping_address) {
                if (typeof order.shipping_address === 'string') {
                    addressStr = order.shipping_address;
                } else if (typeof order.shipping_address === 'object') {
                    // Try to compose generic address fields if they exist, or fallback
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
                total_price: order.total_amount, // Map total_amount -> total_price
                delivery_address: addressStr,      // Map shipping_address -> delivery_address
                status: order.status,
                created_at: order.created_at,
                total_items: order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
            };
        });

        return NextResponse.json({ orders: processedOrders });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
