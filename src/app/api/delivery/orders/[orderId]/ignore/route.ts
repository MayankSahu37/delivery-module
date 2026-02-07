
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

        // Insert into ignored_orders using upsert
        const { error: insertError } = await supabase
            .from('ignored_orders')
            .upsert(
                { order_id: orderId, delivery_boy_id: agentId },
                { onConflict: 'order_id, delivery_boy_id', ignoreDuplicates: true }
            );

        if (insertError) {
            console.error('Ignore order error:', insertError);
            return NextResponse.json({ error: 'Failed to ignore order' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Ignore order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
