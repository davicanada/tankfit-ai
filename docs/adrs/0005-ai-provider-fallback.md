# ADR-0005: Use Sequential AI Provider Fallback with a Deterministic Terminal Mode

**Status:** Accepted
**Date:** August 30, 2026

## Context

TankFit AI must remain publicly demonstrable while using free-tier AI services whose quotas, model availability, and response times may change. The conversational layer also must not replace deterministic compatibility or catalog facts. A streamed response cannot safely move to another provider after partial text has already reached the visitor without mixing two model outputs.

## Decision

Use the Vercel AI SDK behind a server-only provider router. Try one complete, bounded generation from each configured provider in this order:

1. Gemini using `gemini-3.7-flash`
2. Cerebras using `gpt-oss-120b`
3. Groq using `Qwen/Qwen3.6-27B`
4. OpenRouter using `openrouter/free`
5. Deterministic guided mode

Model IDs, provider order, timeout, and output limit are environment-configurable. Each provider receives one attempt with no SDK-level retry, a seven-second default timeout, low reasoning effort where supported, and a bounded response. Three consecutive failures open an in-memory circuit for one minute on the current application instance.

The route recalculates compatibility on the server from strict structured requirements. The model receives only the current conversation and a minimized deterministic evidence object. It receives no provider key, database credential, commercial value, session identifier, or mutation tool.

The first implementation returns a completed answer rather than token streaming. This permits the server to discard a failed or incomplete provider response before trying the next provider. The interface exposes the successful provider or deterministic mode for demonstration and diagnostics without exposing raw provider errors.

## Alternatives Considered

### Stream immediately from the first provider

This improves perceived latency but cannot transparently fail over after response bytes have reached the browser. A mid-stream failure would leave an incomplete answer or require mixing providers.

### Use one provider only

This is simpler, but a free-tier quota or outage would disable the central conversational feature.

### Route every request through OpenRouter

This reduces integration code but creates one additional shared failure boundary and does not demonstrate application-controlled provider fallback.

### Let the model determine compatibility

This conflicts with ADR-0002 and would make product selection non-repeatable and vulnerable to prompt manipulation.

## Consequences

- A visitor may wait through more than one provider timeout before receiving a response.
- Answers appear after completion rather than token by token.
- Provider failures remain isolated from deterministic compatibility.
- The application still works when no AI key is configured or every provider fails.
- The in-memory circuit breaker and rate limiter reduce repeated calls within one warm instance but are not globally distributed. A shared limiter or Vercel Firewall rule remains a public-release requirement when real traffic justifies it.
- Model identifiers must be revalidated before releases because provider catalogs change.
