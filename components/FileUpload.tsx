'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResult {
  chunkCount: number;
  documentId: string;
  fileName: string;
}

export default function FileUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['pdf', 'docx', 'txt'];

  function validateFile(f: File): string | null {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return 'PDF, DOCX, TXT 파일만 업로드 가능합니다.';
    }
    if (f.size > 10 * 1024 * 1024) {
      return '파일 크기는 10MB 이하여야 합니다.';
    }
    return null;
  }

  function selectFile(f: File) {
    const error = validateFile(f);
    if (error) {
      setErrorMessage(error);
      setStatus('error');
      setFile(null);
      return;
    }
    setFile(f);
    setStatus('idle');
    setErrorMessage('');
    setResult(null);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) selectFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    setStatus('uploading');
    setErrorMessage('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push('/admin');
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? '업로드에 실패했습니다.');
        setStatus('error');
        return;
      }

      setResult(data);
      setStatus('success');
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      onUploadSuccess?.();
    } catch {
      setErrorMessage('서버 연결에 실패했습니다.');
      setStatus('error');
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {file ? (
          <div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{formatSize(file.size)}</p>
          </div>
        ) : (
          <div>
            <p className="font-medium text-gray-700">파일을 드래그하거나 클릭하여 선택</p>
            <p className="text-sm text-gray-500 mt-1">PDF, DOCX, TXT · 최대 10MB</p>
          </div>
        )}
      </div>

      {/* 상태 메시지 */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {status === 'success' && result && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          <strong>{result.fileName}</strong> 업로드 완료 — {result.chunkCount}개 청크로 처리되었습니다.
        </div>
      )}

      {/* 업로드 버튼 */}
      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
      >
        {status === 'uploading' ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            처리 중... (문서에 따라 수십 초 소요될 수 있습니다)
          </>
        ) : (
          '업로드 및 처리'
        )}
      </button>
    </div>
  );
}
