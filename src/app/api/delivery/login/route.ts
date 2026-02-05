
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if agent exists
        const { data: agent, error } = await supabase
            .from('delivery_agents')
            .select('id, name, is_active')
            .eq('email', email)
            .single();

        if (error || !agent) {
            return NextResponse.json({ error: 'Invalid email or agent not found' }, { status: 401 });
        }

        if (!agent.is_active) {
            return NextResponse.json({ error: 'Agent account is inactive' }, { status: 403 });
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('delivery_session', agent.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        });

        return NextResponse.json({ success: true, agentId: agent.id });
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
