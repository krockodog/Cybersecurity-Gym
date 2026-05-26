/* ═══════════════════════════════════════════
   Unified LLM Service — Ollama + OpenRouter
   ═══════════════════════════════════════════ */

import { streamOpenRouter, checkOpenRouterStatus, DEFAULT_MODEL, FREE_MODELS } from './openrouter';
import { streamChat, checkOllamaStatus } from './ollama';

export type LLMBackend = 'ollama' | 'openrouter';

export interface LLMConfig {
  backend: LLMBackend;
  model: string;
  fallback: boolean;
}

const DEFAULT_CONFIG: LLMConfig = {
  backend: 'openrouter', // Default to OpenRouter (no local setup needed)
  model: DEFAULT_MODEL,
  fallback: true, // Auto-fallback to other backend on failure
};

/**
 * Unified LLM streaming function.
 * Routes to the configured backend (OpenRouter or Ollama) with automatic fallback.
 *
 * Usage:
 *   // Default: OpenRouter with fallback
 *   for await (const token of streamLLM(systemPrompt, messages)) { ... }
 *
 *   // Force Ollama
 *   for await (const token of streamLLM(systemPrompt, messages, { backend: 'ollama', model: 'llama3.1' })) { ... }
 *
 *   // Force OpenRouter with specific model
 *   for await (const token of streamLLM(systemPrompt, messages, { backend: 'openrouter', model: 'deepseek/deepseek-chat:free' })) { ... }
 */
export async function* streamLLM(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  config: Partial<LLMConfig> = {}
): AsyncGenerator<string, void, unknown> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (cfg.backend === 'openrouter') {
    try {
      yield* streamOpenRouter(cfg.model, systemPrompt, messages);
      return;
    } catch (err: any) {
      console.warn('OpenRouter failed:', err.message);
      if (cfg.fallback) {
        console.log('Falling back to Ollama...');
        yield '\n\n_[Switching to local Ollama...]_\n\n';
        try {
          yield* streamChat('llama3.1', systemPrompt, messages);
        } catch (ollamaErr: any) {
          console.warn('Ollama fallback also failed:', ollamaErr.message);
          throw new Error('Both OpenRouter and Ollama are unavailable. Please check your connection or install Ollama.');
        }
      } else {
        throw err;
      }
    }
  } else {
    try {
      yield* streamChat(cfg.model, systemPrompt, messages);
      return;
    } catch (err: any) {
      console.warn('Ollama failed:', err.message);
      if (cfg.fallback) {
        console.log('Falling back to OpenRouter...');
        yield '\n\n_[Switching to OpenRouter cloud...]_\n\n';
        try {
          yield* streamOpenRouter(DEFAULT_MODEL, systemPrompt, messages);
        } catch (orErr: any) {
          console.warn('OpenRouter fallback also failed:', orErr.message);
          throw new Error('Both Ollama and OpenRouter are unavailable. Please check your connections.');
        }
      } else {
        throw err;
      }
    }
  }
}

/**
 * Check the status of both LLM backends.
 * Returns availability flags for Ollama and OpenRouter.
 */
export async function checkLLMStatus(): Promise<{
  ollama: { available: boolean; models: string[]; error?: string };
  openrouter: { available: boolean; error?: string };
}> {
  const [ollama, openrouter] = await Promise.all([
    checkOllamaStatus(),
    checkOpenRouterStatus(),
  ]);
  return { ollama, openrouter };
}

export { FREE_MODELS, DEFAULT_MODEL };
export type { LLMConfig as LLMConfiguration };
