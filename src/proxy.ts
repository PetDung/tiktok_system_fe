import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const publicPaths = ['/login', '/register', '/add'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;
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
