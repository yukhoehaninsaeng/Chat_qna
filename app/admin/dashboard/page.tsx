'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TextInput from '@/components/TextInput';
import DocumentList from '@/components/DocumentList';

export default function DashboardPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">문서 관리</h1>
            <p className="text-xs text-gray-400">관리자 대시보드</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {loggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 텍스트 입력 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1">내용 등록</h2>
          <p className="text-sm text-gray-500 mb-4">
            챗봇이 참고할 내용을 직접 입력하세요. 저장하면 자동으로 AI가 학습합니다.
          </p>
          <TextInput onSaveSuccess={() => setRefreshKey((k) => k + 1)} />
        </div>

        {/* 등록된 문서 목록 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">등록된 내용</h2>
          <DocumentList refreshTrigger={refreshKey} />
        </div>

        {/* 챗봇 미리보기 */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">챗봇 테스트</p>
          <div className="flex gap-3">
            <a href="/chat" target="_blank" rel="noopener noreferrer"
              className="underline hover:no-underline">
              /chat — 전체 화면 챗봇 →
            </a>
            <a href="/widget" target="_blank" rel="noopener noreferrer"
              className="underline hover:no-underline">
              /widget — 위젯 미리보기 →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
