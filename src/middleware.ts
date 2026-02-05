
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const deliverySession = request.cookies.get('delivery_session');
    const { pathname } = request.nextUrl;

    // Protect dashboard and order details
    if (pathname.startsWith('/delivery') && !pathname.startsWith('/delivery/login')) {
        if (!deliverySession) {
            return NextResponse.redirect(new URL('/delivery/login', request.url));
        }
    }

    // Redirect login to dashboard if already logged in
    if (pathname.startsWith('/delivery/login') && deliverySession) {
        return NextResponse.redirect(new URL('/delivery/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/delivery/:path*'],
};
