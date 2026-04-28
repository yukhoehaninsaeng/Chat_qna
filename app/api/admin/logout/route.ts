import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // 이전 버전(path: '/admin')과 현재 버전(path: '/') 쿠키 모두 삭제
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
  });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    maxAge: 0,
    path: '/admin',
    httpOnly: true,
  });
  return response;
}
