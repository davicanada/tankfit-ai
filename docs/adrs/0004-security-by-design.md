# ADR-0004: Reduce Attack Surface Before Adding Detection Rules

**Status:** Accepted  
**Date:** August 29, 2026

## Context

TankFit AI is an anonymous public application with chat, database-backed session state, external AI calls, role simulation, and generated proposals. Its public availability creates web-security, LLM-security, abuse, and cost-exhaustion risks.

## Decision

Adopt a security-by-design baseline aligned with the project threat model and OWASP ASVS 5.0 principles.

For the MVP:

- Do not accept file uploads, arbitrary URLs, XML, operating-system commands, dynamic code, or user-selected templates.
- Treat visitor and model content as untrusted data.
- Use strict schemas, deterministic tools, per-object server authorization, parameterized database access, safe rendering, same-origin state changes, outbound allowlists, and bounded resource usage.
- Use CSP, security headers, platform DDoS protection, and conservatively staged firewall rules as defense in depth.
- Require negative security tests and no unresolved critical or high-severity threat-model finding before public release.

## Alternatives Considered

### Rely primarily on prompt instructions

Prompt instructions may improve model behavior but cannot reliably prevent prompt injection or enforce authorization. They are not a security boundary.

### Rely primarily on a WAF

A WAF can reduce known exploit traffic and abuse, but it cannot fix broken object authorization, unsafe model tools, DOM XSS, or application-specific logic errors. It may also create false positives.

### Implement broad features and sanitize every input

This preserves maximum flexibility but leaves unnecessary interpreters and data paths exposed. Avoiding an XML parser, shell, upload system, and arbitrary URL fetcher is safer and simpler than attempting to sanitize every possible payload.

## Consequences

- Several attack classes are removed from the MVP by design.
- Custom scenarios remain flexible as text but cannot expand system capabilities.
- Security controls become explicit acceptance criteria and test obligations.
- Some future features require a new ADR and threat-model revision before implementation.
- WAF rules and rate limits must be introduced gradually using observed traffic.
