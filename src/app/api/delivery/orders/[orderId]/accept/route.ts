
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
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

        const agentId = agent.id;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        // 1. Verify order is still pending
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status !== 'paid') {
            return NextResponse.json({ error: 'Order is no longer available' }, { status: 409 });
        }

        // 2. Transact: update status and assign
        // Supabase JS doesn't have a transaction primitive like query builder easily exposed for client,
        // but we can chain instructions or rely on constraints. 
        // Ideally this should be an RPC or careful sequencing.
        // We'll filter the update by status to ensure atomicity.

        // Try to update orders status where status is still paid
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({ status: 'ACCEPTED_FOR_DELIVERY' })
            .eq('id', orderId)
            .eq('status', 'paid') // strictly check again
            .select()
            .single();

        if (updateError || !updatedOrder) {
            // If update returns nothing, it means race condition hit (status changed meanwhile)
            return NextResponse.json({ error: 'Could not accept order (maybe already taken)' }, { status: 409 });
        }

        // 3. Create Assignment Record
        const { error: assignError } = await supabase
            .from('order_delivery_assignments')
            .insert({
                order_id: orderId,
                delivery_boy_id: agentId
            });

        if (assignError) {
            // Critical error: order updated but assignment failed. 
            // Rollback logic (manual) would go here, or assume DB constraints prevent this (order_id unique in assignments)
            // If assignment fails, we should probably revert the order status.
            // For now, let's log.
            console.error('Assignment failed, reverting order status...', assignError);
            await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
            return NextResponse.json({ error: 'Failed to assign order' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Accept order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
