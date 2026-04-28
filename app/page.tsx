import Link from 'next/link';
import ChatPopupButton from '@/components/ChatPopupButton';

const BJ_RED = '#D91F26';
const BJ_GRADIENT = 'linear-gradient(135deg, #D91F26 0%, #F5A000 100%)';

export default function HomePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bumjinchatbot.vercel.app';
  const iframeCode = `<iframe\n  src="${appUrl}/embed"\n  style="position:fixed;bottom:0;right:0;width:430px;height:640px;border:none;z-index:2147483647;"\n  allowtransparency="true"\n></iframe>`;

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff9f0 100%)' }}>
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 로고 영역 */}
        <div>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg"
            style={{ background: BJ_GRADIENT }}
          >
            BJ
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>범진전자 AI 도우미</h1>
          <p className="text-gray-500 mt-2">
            업무 문서를 기반으로 직원들의 질문에 즉시 답변하는 AI 어시스턴트
          </p>
        </div>

        {/* 사용 방법 2가지 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* 팝업 채팅 */}
          <ChatPopupButton />

          {/* 위젯 삽입 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #595959, #333)' }}>
              &lt;/&gt;
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">다른 웹사이트에 삽입</h2>
            <p className="text-sm text-gray-500 mb-3">iframe 한 줄로 어느 웹사이트에나 위젯을 추가합니다</p>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
              <code>{iframeCode}</code>
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
