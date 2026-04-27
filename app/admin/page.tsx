import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import AdminLogin from '@/components/AdminLogin';

export const metadata = { title: '관리자 로그인' };

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token && (await validateSession(token))) {
    redirect('/admin/dashboard');
  }

  return <AdminLogin />;
}
