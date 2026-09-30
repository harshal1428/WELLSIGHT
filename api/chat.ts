import { handleGeminiChat } from '../server/gemini';

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const result = await handleGeminiChat(rawBody, process.env.GEMINI_API_KEY);
  return res.status(result.status).json(result.body);
}
