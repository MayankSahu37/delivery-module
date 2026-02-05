import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.agentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;

        // Verify the order is assigned to this agent
        const { data: assignment, error: assignmentError } = await supabase
            .from('order_delivery_assignments')
            .select('*')
            .eq('order_id', orderId)
            .eq('delivery_boy_id', session.agentId)
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
