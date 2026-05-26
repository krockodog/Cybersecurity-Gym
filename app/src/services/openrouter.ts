/* ═══════════════════════════════════════════
   OpenRouter API Service — Free LLM Backend
   ═══════════════════════════════════════════ */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY || '';

// Free models ranked by tutoring quality
export const FREE_MODELS = [
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', quality: 10, speed: 6, context: '128K', description: 'Best free model for tutoring' },
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3', quality: 9, speed: 7, context: '64K', description: 'Excellent reasoning capabilities' },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', quality: 7, speed: 9, context: '128K', description: 'Versatile, good reasoning' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', quality: 7, speed: 10, context: '32K', description: 'Fast, good for tutoring' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B', quality: 6, speed: 9, context: '8K', description: 'Google model, efficient' },
  { id: 'qwen/qwen-2.5-7b-instruct:free', name: 'Qwen 2.5 7B', quality: 6, speed: 9, context: '32K', description: 'Strong coding, multilingual' },
];

export const DEFAULT_MODEL = FREE_MODELS[0].id;

/**
 * Stream chat completions from OpenRouter.
 * Uses Server-Sent Events (SSE) format with streaming JSON chunks.
 */
export async function* streamOpenRouter(
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'trygit.me Cybersecurity Gymnasium',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    // Handle rate limiting (429) gracefully
    if (response.status === 429) {
      throw new Error('OpenRouter rate limit reached. Please wait a moment and try again.');
    }
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed chunks
        }
      }
    }
  }
}

/**
 * Quick health check for OpenRouter connectivity.
 * Uses a minimal request to verify the API key and endpoint are working.
 */
export async function checkOpenRouterStatus(): Promise<{ available: boolean; error?: string }> {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) {
      return { available: true };
    }
    if (response.status === 429) {
      return { available: true, error: 'Rate limited — service is up but busy' };
    }
    return { available: false, error: `HTTP ${response.status}` };
  } catch (err: any) {
    return { available: false, error: err.message || 'Network error' };
  }
}
