import Link from 'next/link';

export default function HomePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-domain.vercel.app';
  const embedCode = `<script src="${appUrl}/widget.js"></script>`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">사내 문서 Q&A 챗봇</h1>
          <p className="text-gray-600 mt-2">
            회사 내부 문서를 업로드하고, AI가 즉시 답변하는 어시스턴트
          </p>
        </div>

        {/* 사용 방법 2가지 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* 직접 접속 */}
          <Link href="/chat"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition group border-2 border-transparent hover:border-blue-500">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
              <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">챗봇 바로 사용</h2>
            <p className="text-sm text-gray-500">이 웹사이트에서 직접 문서 기반 Q&A를 이용합니다</p>
            <p className="text-xs text-blue-600 mt-3 font-medium">바로 시작하기 →</p>
          </Link>

          {/* 위젯 삽입 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">다른 웹사이트에 삽입</h2>
            <p className="text-sm text-gray-500 mb-3">스크립트 한 줄로 어느 웹사이트에나 채팅 위젯을 추가합니다</p>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
          </div>
        </div>

        {/* 관리자 링크 */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            문서 관리 (관리자)
          </Link>
        </div>
      </div>
    </main>
  );
}
