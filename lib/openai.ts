import OpenAI from 'openai';

let _client: OpenAI | null = null;

// lazy 초기화 - 빌드 시 환경변수 없어도 import 가능
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export function getOpenAI(): OpenAI {
  return getClient();
}

export async function embedText(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replace(/\n/g, ' '),
    encoding_format: 'float',
  });
  return response.data[0].embedding;
}
