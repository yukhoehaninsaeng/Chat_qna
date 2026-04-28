'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'bumjin_chat_v1';
const TTL_MS = 24 * 60 * 60 * 1000;
const BJ_RED = '#D91F26';
const BJ_GRADIENT = 'linear-gradient(135deg, #D91F26 0%, #F5A000 100%)';

function getTextFromParts(parts: UIMessage['parts']): string {
  return parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('');
}

function loadStoredMessages(): UIMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const { messages, savedAt } = JSON.parse(raw) as { messages: UIMessage[]; savedAt: number };
    if (Date.now() - savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return messages;
  } catch {
    return [];
  }
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const isLoading = status === 'streaming' || status === 'submitted';
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadStoredMessages();
    if (stored.length > 0) setMessages(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, savedAt: Date.now() }));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F8F8' }}>
      {/* 헤더 */}
      <header className="text-white px-6 py-4 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: BJ_GRADIENT }}>
        <img src="/bjbot.png" alt="BJ" className="w-14 h-14 object-contain" />
        <div>
          <h1 className="font-bold text-base leading-tight">범진전자 AI 도우미</h1>
          <p className="text-xs text-white/70">업무 문서 기반으로 답변합니다</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 bg-green-300 rounded-full"></span>
          <span className="text-xs text-white/70">온라인</span>
        </div>
      </header>

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl w-full mx-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-16">
            <img src="/bjbot.png" alt="BJ" className="w-32 h-32 mx-auto mb-4 object-contain" />
            <h2 className="text-lg font-semibold text-gray-800">무엇이든 물어보세요</h2>
            <p className="text-sm text-gray-400 mt-2">
              범진전자 내부 문서를 기반으로 정확하게 답변드립니다
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                '휴가 신청은 어떻게 하나요?',
                '출장비 처리 절차가 궁금해요',
                '사내 복지 제도를 알려주세요',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { sendMessage({ text: q }); }}
                  className="bg-white border text-sm px-4 py-2 rounded-full transition hover:shadow-sm"
                  style={{ borderColor: BJ_RED, color: BJ_RED }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = BJ_RED; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BJ_RED; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = getTextFromParts(m.parts);
          if (!text) return null;
          return (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <img src="/bjbot.png" alt="BJ" className="w-10 h-10 object-contain flex-shrink-0 mt-0.5" />
              )}
              <div
                className="max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm"
                style={
                  m.role === 'user'
                    ? { background: BJ_RED, color: '#fff', borderBottomRightRadius: 4 }
                    : { background: '#fff', color: '#333', borderBottomLeftRadius: 4, border: '1px solid #eee' }
                }
              >
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <img src="/bjbot.png" alt="BJ" className="w-10 h-10 object-contain flex-shrink-0 mt-0.5" />
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: BJ_RED, animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: BJ_RED, animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#F5A000', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* 입력창 */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 업무 내용을 입력하세요..."
            disabled={isLoading}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm transition disabled:opacity-60"
            style={{ outline: 'none' }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${BJ_RED}`; e.currentTarget.style.background = '#fff'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f3f4f6'; }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="text-white px-5 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2 disabled:opacity-40"
            style={{ background: BJ_RED }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
