# cliagents

**Repository**: [github.com/suyashb734/cliagents](https://github.com/suyashb734/cliagents)
**License**: MIT
**Status**: Active development

## Overview

cliagents is a Node.js server that transforms CLI-based AI agents into programmatic services. It wraps tools like Claude Code, Gemini CLI, and Codex through HTTP REST and WebSocket APIs.

## Value Proposition

"Most developers use API keys to integrate AI into their apps, paying per token. But if you already have a Claude Pro, ChatGPT Plus, or Google account, you're paying twice."

By maintaining persistent sessions with CLI agents, cliagents eliminates redundant costs during development.

## Architecture

```
Application Layer → HTTP/WebSocket Server → Session Manager →
Adapter Layer (Claude, Gemini, Codex) → CLI Processes
```

## Installation

```bash
git clone https://github.com/suyashb734/cliagents.git
cd cliagents
npm install
npm start
```

Server runs at `http://localhost:3001` with WebSocket at `ws://localhost:3001/ws`.

## API

### REST Endpoints
- Health checks and adapter discovery
- Session lifecycle (create, list, terminate)
- Message sending with streaming
- OpenAI-compatible `/v1/chat/completions`

### OpenAI SDK Compatibility

```javascript
const client = new OpenAI({
  baseURL: 'http://localhost:3001/v1',
  apiKey: 'unused'
});

const response = await client.chat.completions.create({
  model: 'claude-sonnet-4-20250514',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true
});
```

### REST API Examples

**Create Session:**
```bash
curl -X POST http://localhost:3001/sessions \
  -H "Content-Type: application/json" \
  -d '{"adapter": "claude-code"}'
```

**Send Message:**
```bash
curl -X POST http://localhost:3001/sessions/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?"}'
```

### WebSocket Protocol
```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.send(JSON.stringify({ type: 'create_session', adapter: 'claude-code' }));
ws.send(JSON.stringify({ type: 'send_message', message: 'Hello!' }));
```

## Supported Adapters

### Production-Ready (Tested)
- **Claude Code** - Best for coding tasks, model selection supported
- **Gemini CLI** - Free with Google account

### Implemented (Untested)
- OpenAI Codex
- Mistral Vibe
- Amazon Q
- Plandex
- GitHub Copilot

### API Key Routers
- Aider, Goose, Shell-GPT, aichat, Continue CLI

## Configuration

```javascript
{
  port: 3001,
  sessionTimeout: 300000,  // 5 minutes
  maxConcurrentSessions: 10,
  adapters: {
    'claude-code': { enabled: true },
    'gemini': { enabled: true }
  }
}
```

## Production Migration

When ready for production, switch to official APIs:

1. **Direct switch**: Change `baseURL` and `apiKey`
2. **LiteLLM proxy**: Multi-provider abstraction
3. **Environment routing**: Dev uses cliagents, prod uses APIs

## Security Notes

**No built-in authentication** - intended for local development only. Do not expose to public internet without reverse proxy authentication.

## Custom Adapter Template

```typescript
class MyAdapter extends AgentAdapter {
  isAvailable(): Promise<boolean> { ... }
  spawn(): Promise<Session> { ... }
  send(message: string): Promise<void> { ... }
  terminate(): Promise<void> { ... }
}
```

## Comparison to CLI Agent MCP Server

| Feature | cliagents | CLI Agent MCP |
|---------|-----------|---------------|
| Interface | HTTP REST + WebSocket | MCP Protocol |
| SDK Compat | OpenAI SDK drop-in | Requires MCP client |
| Discovery | Any HTTP client | MCP-aware tools only |
| Delegation | Direct API calls | MCP tool invocation |
| Session Mgmt | Built-in with timeouts | Custom implementation |

## Use Case

cliagents is for **programmatic access** to CLI agents - enabling any application (not just MCP-aware ones) to delegate work to Claude Code, Gemini, or Codex.

---

*Last updated: 2025-12-23*
*Source: GitHub repository*
