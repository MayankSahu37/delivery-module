
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireDeliverySession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> } // Updated to Promise for Next.js 15+ or latest App Router types, generally safe
) {
    const { orderId } = await params;
    try {
        await requireDeliverySession();

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
