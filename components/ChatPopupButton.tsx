'use client';

export default function ChatPopupButton() {
  return (
    <button
      onClick={() => window.open('/chat', 'bjchat', 'width=420,height=700,resizable=yes')}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition w-full text-left border-2 border-transparent hover:border-red-500"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, #D91F26 0%, #F5A000 100%)' }}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="font-semibold text-gray-900 mb-1">챗봇 바로 사용</h2>
      <p className="text-sm text-gray-500">팝업 창으로 문서 기반 Q&amp;A를 이용합니다</p>
      <p className="text-xs font-medium mt-3" style={{ color: '#D91F26' }}>팝업으로 열기 →</p>
    </button>
  );
}
