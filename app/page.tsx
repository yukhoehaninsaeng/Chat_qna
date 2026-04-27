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
            회사 내부 문서를 업로드하고, 직원들이 언제든지 궁금한 것을 물어볼 수 있는 AI 어시스턴트
          </p>
        </div>

        {/* 기능 소개 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: '📄',
              title: '문서 업로드',
              desc: 'PDF, DOCX, TXT 파일을 업로드하면 자동으로 분석합니다',
            },
            {
              icon: '🔍',
              title: 'AI 검색',
              desc: '질문의 의미를 파악해 가장 관련성 높은 내용을 찾아냅니다',
            },
            {
              icon: '💬',
              title: '위젯 삽입',
              desc: '스크립트 한 줄로 어떤 웹사이트에나 채팅 위젯을 삽입할 수 있습니다',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 위젯 삽입 코드 */}
        <div className="bg-white rounded-xl p-6 shadow-sm text-left">
          <h2 className="font-semibold text-gray-900 mb-3">위젯 삽입 방법</h2>
          <p className="text-sm text-gray-600 mb-3">
            아래 코드를 웹사이트의 <code className="bg-gray-100 px-1 rounded">&lt;body&gt;</code> 태그 끝에 추가하세요:
          </p>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
        </div>

        {/* 관리자 페이지 링크 */}
        <div>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            관리자 페이지
          </a>
        </div>
      </div>
    </main>
  );
}
