export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { embedText } from '@/lib/openai';
import { chunkText } from '@/lib/rag';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const EMBED_BATCH_SIZE = 10;

type FileType = 'pdf' | 'docx' | 'txt';

async function extractText(file: File, type: FileType): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (type === 'pdf') {
    // pdf-parse는 서버 런타임에서만 동작
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (type === 'docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // txt
  return buffer.toString('utf-8');
}

export async function POST(req: NextRequest) {
  // 인증 확인
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes: FileType[] = ['pdf', 'docx', 'txt'];
    if (!extension || !allowedTypes.includes(extension as FileType)) {
      return NextResponse.json(
        { error: 'PDF, DOCX, TXT 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    const fileType = extension as FileType;

    // 텍스트 추출
    const text = await extractText(file, fileType);
    if (!text.trim()) {
      return NextResponse.json(
        { error: '파일에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 청킹
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json({ error: '텍스트 청킹 실패' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // documents 테이블에 문서 메타데이터 저장
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        type: fileType,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (docError || !document) {
      throw new Error(`문서 저장 실패: ${docError?.message}`);
    }

    // 임베딩: rate limit 대응을 위해 배치 처리
    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
      const batchEmbeddings = await Promise.all(batch.map(embedText));
      embeddings.push(...batchEmbeddings);
    }

    // document_chunks 테이블에 저장
    const chunkRows = chunks.map((content, index) => ({
      document_id: document.id,
      content,
      embedding: embeddings[index],
      chunk_index: index,
    }));

    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkRows);

    if (chunksError) {
      // 청크 저장 실패 시 문서도 롤백
      await supabase.from('documents').delete().eq('id', document.id);
      throw new Error(`청크 저장 실패: ${chunksError.message}`);
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      chunkCount: chunks.length,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
