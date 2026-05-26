import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const session = request.cookies.get('daylight_admin');

  // Already logged in — redirect away from login page
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Not logged in — send to login page
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
