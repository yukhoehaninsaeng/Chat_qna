-- ============================================================
-- Chat Q&A 챗봇 Supabase 스키마
-- 실행 전: Supabase 대시보드 > Extensions > vector 활성화 필요
-- ============================================================

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- documents: 업로드된 파일 메타데이터
-- ============================================================
CREATE TABLE documents (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('pdf', 'docx', 'txt')),
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- document_chunks: 텍스트 청크 + 벡터 임베딩
-- ============================================================
CREATE TABLE document_chunks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  embedding    vector(1536),  -- text-embedding-3-small 차원
  chunk_index  INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat 인덱스 (코사인 유사도 기반 ANN 검색)
CREATE INDEX ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- Row Level Security (서버에서 service_role 키로만 접근)
-- ============================================================
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_all_documents"
  ON documents FOR ALL USING (false);

CREATE POLICY "deny_all_chunks"
  ON document_chunks FOR ALL USING (false);

-- ============================================================
-- match_documents: 벡터 유사도 검색 함수
-- 사용: supabase.rpc('match_documents', { query_embedding, match_threshold, match_count })
-- ============================================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding  vector(1536),
  match_threshold  FLOAT DEFAULT 0.5,
  match_count      INT   DEFAULT 5
)
RETURNS TABLE (
  id           UUID,
  document_id  UUID,
  content      TEXT,
  similarity   FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
