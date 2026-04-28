export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { embedText } from '@/lib/openai';
import { findRelevantChunks, buildSystemPrompt } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '메시지가 없습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 마지막 사용자 메시지로 RAG 검색
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');

    const query = lastUserMessage?.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join(' ') ?? '';

    // 질문 임베딩 후 유사 청크 검색
    const queryEmbedding = await embedText(query);
    const relevantChunks = await findRelevantChunks(queryEmbedding, 5, 0.2);
    const systemPrompt = buildSystemPrompt(relevantChunks);

    const openaiProvider = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openaiProvider('gpt-4o-mini'),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.2,
      maxOutputTokens: 1500,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
