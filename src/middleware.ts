
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Redirect legacy login page to dashboard (which handles auth)
    if (request.nextUrl.pathname === '/delivery/login') {
        return NextResponse.redirect(new URL('/delivery/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/delivery/:path*'],
};
