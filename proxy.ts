import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token || !(await validateSession(token))) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
