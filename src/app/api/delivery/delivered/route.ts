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

        // Get all delivered orders for this agent
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                id,
                total_amount,
                shipping_address,
                status,
                created_at,
                updated_at,
                assigned_at,
                order_items (
                    quantity,
                    price_at_purchase
                )
            `)
            .eq('assigned_to_delivery_boy_id', agent.id)
            .eq('status', 'DELIVERED')
            .order('updated_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Process orders
        const ordersWithItems = (orders || []).map((order) => {
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

            // Calculate total price and items
            // We use total_amount from orders table if available, else fallback to calculation?
            // Actually, let's use total_amount as primary source as per other endpoints.

            const items = order.order_items || [];
            const totalItems = items.length; // Keeping existing logic of counting distinct items, or should I sum quantities? 
            // Other endpoints sum quantities. I'll sum quantities to be consistent with the "Order" concept, 
            // but if the frontend expects distinct item count, it might break.
            // Let's stick to what was there: items?.length. 
            // Wait, previous code was: total_items: items?.length || 0

            return {
                id: order.id,
                total_price: order.total_amount,
                delivery_address: addressStr,
                status: order.status,
                created_at: order.created_at,
                total_items: totalItems,
                assigned_at: order.assigned_at,
                delivered_at: order.updated_at
            };
        });

        return NextResponse.json({ orders: ordersWithItems });
    } catch (error: any) {
        console.error('Fetch delivered orders error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch delivered orders' },
            { status: 500 }
        );
    }
}
