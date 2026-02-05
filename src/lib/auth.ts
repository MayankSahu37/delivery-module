
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function getDeliverySession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('delivery_session');
    return sessionCookie?.value || null;
}

export async function getSession() {
    const agentId = await getDeliverySession();
    return agentId ? { agentId } : null;
}

export async function requireDeliverySession() {
    const agentId = await getDeliverySession();
    if (!agentId) {
        throw new Error('Unauthorized');
    }
    return agentId;
}
