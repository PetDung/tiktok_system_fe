import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/add'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }
    if (!token) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

// Apply middleware to all routes except static files & _next
export const config = {
    matcher: [
        '/((?!_next|static|favicon.ico|.*\\..*).*)'
    ]
};
