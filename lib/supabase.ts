import { createClient } from '@supabase/supabase-js';

// 서버 전용 클라이언트 (service_role 키 사용, RLS 우회)
// 매 요청마다 새 인스턴스 생성으로 서버리스 환경에서 상태 누수 방지
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
