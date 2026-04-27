import { createServiceClient } from './supabase';

// 재귀 텍스트 청킹: 문단 → 줄 → 문장 → 단어 순으로 분리
export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const separators = ['\n\n', '\n', '. ', ' ', ''];

  function splitWithSeparator(text: string, separatorIndex: number): string[] {
    if (text.length <= chunkSize) return [text];
    if (separatorIndex >= separators.length) {
      // 마지막 수단: 문자 단위 강제 분리
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.slice(i, i + chunkSize));
      }
      return chunks;
    }

    const sep = separators[separatorIndex];
    const parts = sep ? text.split(sep) : text.split('');
    const chunks: string[] = [];
    let current = '';

    for (const part of parts) {
      const candidate = current ? current + sep + part : part;
      if (candidate.length > chunkSize && current) {
        chunks.push(current.trim());
        // overlap: 이전 청크 끝부분을 다음 청크 시작에 포함
        const overlapText = current.slice(-overlap);
        current = overlapText + sep + part;
      } else {
        current = candidate;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    // 여전히 chunkSize 초과하는 청크는 재귀 분리
    const result: string[] = [];
    for (const chunk of chunks) {
      if (chunk.length > chunkSize) {
        result.push(...splitWithSeparator(chunk, separatorIndex + 1));
      } else {
        result.push(chunk);
      }
    }
    return result;
  }

  return splitWithSeparator(text, 0).filter((c) => c.length > 0);
}

export interface MatchedChunk {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

export async function findRelevantChunks(
  queryEmbedding: number[],
  matchCount = 5,
  matchThreshold = 0.5
): Promise<MatchedChunk[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });
  if (error) throw new Error(`벡터 검색 실패: ${error.message}`);
  return (data as MatchedChunk[]) ?? [];
}

export function buildSystemPrompt(chunks: MatchedChunk[]): string {
  if (chunks.length === 0) {
    return `당신은 회사 문서를 기반으로 답변하는 어시스턴트입니다.
현재 관련 문서를 찾지 못했습니다. 업로드된 문서가 없거나 질문과 관련된 내용이 없다고 사용자에게 안내하세요.`;
  }

  const context = chunks
    .map((c, i) => `[참조 ${i + 1}]\n${c.content}`)
    .join('\n\n---\n\n');

  return `당신은 회사 내부 문서를 기반으로 답변하는 어시스턴트입니다.
반드시 아래 제공된 문서 내용만을 근거로 답변하세요.
문서에 없는 내용은 "해당 내용은 문서에서 찾을 수 없습니다."라고 답변하세요.
절대 임의로 내용을 만들어내지 마세요.
답변은 한국어로 작성하세요.

참조 문서:
${context}`;
}
