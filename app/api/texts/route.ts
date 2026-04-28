export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { embedText } from '@/lib/openai';
import { chunkText } from '@/lib/rag';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';

const EMBED_BATCH_SIZE = 10;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
    }

    const chunks = chunkText(content.trim());
    if (chunks.length === 0) {
      return NextResponse.json({ error: '내용이 너무 짧습니다.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: title.trim(),
        type: 'txt',
        size_bytes: new TextEncoder().encode(content).length,
      })
      .select()
      .single();

    if (docError || !document) {
      throw new Error(`문서 저장 실패: ${docError?.message}`);
    }

    // 임베딩 배치 처리
    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
      const batchEmbeddings = await Promise.all(batch.map(embedText));
      embeddings.push(...batchEmbeddings);
    }

    const chunkRows = chunks.map((text, index) => ({
      document_id: document.id,
      content: text,
      embedding: embeddings[index],
      chunk_index: index,
    }));

    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkRows);

    if (chunksError) {
      await supabase.from('documents').delete().eq('id', document.id);
      throw new Error(`청크 저장 실패: ${chunksError.message}`);
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      chunkCount: chunks.length,
      title: title.trim(),
    });
  } catch (error) {
    console.error('Text save error:', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    const isEnvError = message.includes('supabaseUrl') || message.includes('environment');
    return NextResponse.json(
      { error: isEnvError ? 'Supabase 환경변수가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.' : message },
      { status: 500 }
    );
  }
}
