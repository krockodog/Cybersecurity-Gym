# Ollama Integration Reference

## Overview

The 1-on-1 Tutor uses Ollama for local LLM inference. All processing happens on the user's machine — no data leaves the local environment.

## Ollama Installation

### Windows
```powershell
# Download from https://ollama.com/download
# Or via winget:
winget install Ollama.Ollama
```

### macOS
```bash
# Download from https://ollama.com/download
# Or via Homebrew:
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## Model Download

```bash
# Recommended default (7B parameters, fast, good quality):
ollama pull llama3

# Larger model for better answers (requires more RAM):
ollama pull llama3:13b

# Alternative models:
ollama pull mistral          # Very efficient
ollama pull codellama        # Code-focused
ollama pull neural-chat      # Conversation-optimized
```

## Start Ollama Server

```bash
# Start the Ollama server (runs in background):
ollama serve

# Verify it's running:
curl http://localhost:11434/api/tags

# Expected response: JSON list of installed models
```

## Configuration in Code

### Endpoint
```typescript
// src/services/ollama.ts
const OLLAMA_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3';
```

### Streaming Chat Function
```typescript
export async function* streamChat(
  model: string,
  systemPrompt: string,
  messages: Array<{role: string; content: string}>
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true
    })
  });
  // Yields tokens as they arrive via SSE
}
```

## RAG System Integration

### How RAG Works

1. User asks a question in the Tutor chat
2. `searchQuestions(query, limit)` searches all databases
3. TF-IDF scoring with domain keyword boosts
4. Top-matching questions formatted as context
5. Context injected into professor's system prompt
6. Ollama generates contextualized answer

### Domain Keywords (src/services/rag.ts)

```typescript
const DOMAIN_KEYWORDS = {
  'penetration-testing': ['exploit', 'payload', 'metasploit', 'burp', 'nmap', ...],
  'vulnerability': ['cve', 'cvss', 'scan', 'assessment', 'remediation', ...],
  'network': ['tcp', 'udp', 'subnet', 'osi', 'routing', 'firewall', ...],
  'cryptography': ['aes', 'rsa', 'hash', 'certificate', 'tls', 'encryption', ...],
  'forensics': ['evidence', 'chain of custody', 'hash', 'timeline', 'acquisition', ...],
  // ... 15 domain mappings total
};
```

### RAG-Enhanced Prompt

```typescript
function createRAGSystemPrompt(professorId: string, userQuery: string): string {
  const basePrompt = PROFESSOR_PROMPTS[professorId];
  const ragContext = getContextForTopic(userQuery, 3);
  const weaknesses = getStudentWeaknesses();
  return `${basePrompt}\n\nRELEVANT EXAM QUESTIONS:\n${ragContext}\n\nSTUDENT WEAKNESSES:\n${weaknesses}`;
}
```

## Connection Status

The Tutor UI shows a connection indicator:
- **Green dot** (`ollamaStatus === 'connected'`): Ollama reachable, model loaded
- **Red dot** (`ollamaStatus === 'disconnected'`): Ollama not found at localhost:11434
- **Status check** runs every 10 seconds via `checkOllamaStatus()`

## Chat Persistence

Chats are stored per professor in localStorage:
```
Key: tutor_chat_${professorId}
Value: JSON array of {role, content, timestamp} objects
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Red connection dot | Ollama not running | `ollama serve` in terminal |
| Model not found | Model not downloaded | `ollama pull llama3` |
| Slow responses | Model too large | Use smaller model: `llama3` instead of `llama3:70b` |
| CORS error | Browser blocking localhost | Check Ollama CORS settings or use different browser |
| Out of memory | Model exceeds RAM | Use 7B model, close other apps, add swap |
| Empty responses | Context too long | Reduce RAG context limit in rag.ts |

## System Requirements

| Model | Minimum RAM | Recommended RAM | GPU |
|-------|-------------|-----------------|-----|
| llama3 (7B) | 8 GB | 16 GB | Optional |
| llama3:13b | 16 GB | 32 GB | Optional |
| llama3:70b | 64 GB | 128 GB | Recommended |
| mistral (7B) | 8 GB | 16 GB | Optional |
