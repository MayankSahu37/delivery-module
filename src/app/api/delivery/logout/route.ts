
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();

        // Delete the session cookie
        cookieStore.delete('delivery_session');

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Logout error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
