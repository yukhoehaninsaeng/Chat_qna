'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'bumjin_chat_v1';
const TTL_MS = 24 * 60 * 60 * 1000;

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

const BJ_RED = '#D91F26';
const BJ_GRADIENT = 'linear-gradient(135deg, #D91F26 0%, #F5A000 100%)';

function BjAvatar({ size = 6 }: { size?: number }) {
  const px = size * 4;
  return (
    <img
      src="/bjbot.png"
      alt="BJ 도우미"
      style={{ width: px, height: px, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}

export default function ChatWidget({ className = 'h-screen' }: { className?: string }) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const isLoading = status === 'streaming' || status === 'submitted';
  const bottomRef = useRef<HTMLDivElement>(null);

  // 마운트 시 localStorage에서 복원 (24시간 TTL)
  useEffect(() => {
    const stored = loadStoredMessages();
    if (stored.length > 0) setMessages(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 메시지 변경 시 localStorage에 저장
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
    <div className={`flex flex-col ${className} bg-white`}>
      {/* 헤더 */}
      <div
        className="text-white px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ background: BJ_GRADIENT }}
      >
        <BjAvatar size={11} />
        <div>
          <p className="font-semibold text-sm leading-tight">범진전자 AI 도우미</p>
          <p className="text-xs text-white/70">문서 기반으로 답변합니다</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
          <span className="text-xs text-white/70">온라인</span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#FAFAFA' }}>
        {messages.length === 0 && (
          <div className="text-center mt-8">
            <BjAvatar size={20} />
            <p className="text-sm font-medium text-gray-700 mt-3">무엇이든 물어보세요</p>
            <p className="text-xs text-gray-400 mt-1">범진전자 업무 문서를 기반으로 답변합니다</p>
          </div>
        )}

        {messages.map((m) => {
          const text = getTextFromParts(m.parts);
          if (!text) return null;
          return (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="mr-2 mt-0.5">
                  <BjAvatar size={9} />
                </div>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
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
          <div className="flex justify-start">
            <div className="mr-2 mt-0.5">
              <BjAvatar size={6} />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            disabled={isLoading}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm transition disabled:opacity-60"
            style={{ outline: 'none' }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${BJ_RED}`; e.currentTarget.style.background = '#fff'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f3f4f6'; }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition disabled:opacity-40"
            style={{ background: BJ_RED }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
