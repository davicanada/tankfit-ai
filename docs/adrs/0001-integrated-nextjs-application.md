# ADR-0001: Use One Integrated Next.js Application

**Status:** Accepted  
**Date:** August 29, 2026

## Context

TankFit AI is a web-first public portfolio project maintained by one developer. It requires server-rendered catalog pages, interactive discovery, streamed AI responses, relational data, deterministic business rules, simulated transactions, and downloadable proposals.

## Decision

Use one TypeScript and Next.js App Router application deployed on Vercel with the default Node.js runtime. Use Server Components for internal reads, Server Actions for interface-originated mutations, and Route Handlers for streaming or external HTTP boundaries.

## Alternatives Considered

### Separate frontend and backend services

This provides independent scaling and deployment boundaries, but creates duplicated data contracts, cross-origin configuration, another set of secrets and logs, and two cold-start and failure domains. The MVP has no team or workload boundary that justifies this complexity.

### Browser-only static application

This would be inexpensive and resilient for catalog browsing, but cannot safely protect AI-provider keys, enforce session-scoped approval, persist an audit trail, or revalidate transactional data.

## Consequences

- Product and server types can be shared in one codebase.
- Only one application deployment is required.
- Node.js supports the selected database, cryptography, streaming, and document-generation needs.
- Domain logic must remain framework-independent so it can be extracted later if necessary.
- A future service split requires a new ADR and evidence of a genuine scaling, security, ownership, or lifecycle boundary.
