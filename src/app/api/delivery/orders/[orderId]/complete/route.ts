import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
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

        const { orderId } = await params;

        // Verify the order is assigned to this agent
        const { data: assignment, error: assignmentError } = await supabase
            .from('order_delivery_assignments')
            .select('*')
            .eq('order_id', orderId)
            .eq('delivery_boy_id', agent.id)
            .single();

        if (assignmentError || !assignment) {
            return NextResponse.json(
                { error: 'Order not found or not assigned to you' },
                { status: 404 }
            );
        }

        // Update order status to DELIVERED
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'DELIVERED',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            message: 'Order marked as delivered'
        });
    } catch (error: any) {
        console.error('Complete order error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to complete order' },
            { status: 500 }
        );
    }
}
