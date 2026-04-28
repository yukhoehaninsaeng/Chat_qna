'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function TextInput({ onSaveSuccess }: { onSaveSuccess?: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setMessage('');

    try {
      const res = await fetch('/api/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push('/admin');
        return;
      }

      if (!res.ok) {
        setMessage(data.error ?? '저장에 실패했습니다.');
        setStatus('error');
        return;
      }

      setMessage(`"${data.title}" 저장 완료 — ${data.chunkCount}개 청크로 처리됐습니다.`);
      setStatus('success');
      setTitle('');
      setContent('');
      onSaveSuccess?.();
    } catch {
      setMessage('서버 연결에 실패했습니다.');
      setStatus('error');
    }
  }

  const charCount = content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 연차 규정, 출장비 처리 방법, 제품 매뉴얼"
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="챗봇이 참고할 내용을 입력하세요.&#10;&#10;예)&#10;연차휴가는 입사 1년 미만의 경우 월 1일씩 최대 11일이 부여됩니다.&#10;연차 신청은 사내 시스템에서 최소 3일 전에 신청해야 합니다."
          required
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{charCount.toLocaleString()}자</p>
      </div>

      {/* 상태 메시지 */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}
      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* 저장 버튼 */}
      <button
        type="submit"
        disabled={status === 'saving' || !title.trim() || !content.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
      >
        {status === 'saving' ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            처리 중... (임베딩 생성 중)
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            저장 및 학습
          </>
        )}
      </button>
    </form>
  );
}
