
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> } // Updated to Promise for Next.js 15+ or latest App Router types, generally safe
) {
    const { orderId } = await params;
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

        // agentId is available if needed, but RLS might handle it? 
        // Actually this route just gets order details, so we just check access.
        // But some logic might rely on agentId later? No, this just fetches order.
        // Wait, does it check if order is assigned to agent? 
        // The original code `await requireDeliverySession()` just returned agentId but it wasn't used for filtering 
        // in the query: .eq('id', orderId).single()
        // So any logged in agent can view any order?
        // The implementation summary says "Order Details Page... Detailed view of individual orders".
        // It seems open to any agent.


        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
        id,
        total_amount,
        shipping_address,
        status,
        created_at,
        order_items (
          id,
          medicine_id,
          quantity,
          price:price_at_purchase
        )
      `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Address mapping
        let addressStr = 'No address provided';
        if (order.shipping_address) {
            if (typeof order.shipping_address === 'string') {
                addressStr = order.shipping_address;
            } else if (typeof order.shipping_address === 'object') {
                const { street, city, state, zip, address_line1 } = order.shipping_address;
                const parts = [street || address_line1, city, state, zip].filter(Boolean);
                if (parts.length > 0) addressStr = parts.join(', ');
                else addressStr = JSON.stringify(order.shipping_address);
            }
        }

        // Calculate total quantity
        const total_items = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

        return NextResponse.json({
            order: {
                ...order,
                total_price: order.total_amount,
                delivery_address: addressStr,
                total_items
            }
        });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch order detail error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
