import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidAdminSession } from '@/lib/adminSession';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const hasValidSession = await isValidAdminSession(request.cookies.get('daylight_admin')?.value);

  // Already logged in — redirect away from login page
  if (isLoginPage && hasValidSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Not logged in — send to login page
  if (!isLoginPage && !hasValidSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
