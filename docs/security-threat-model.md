# Security Threat Model

**Status:** Required for MVP  
**Owner:** Davi Almeida  
**Baseline:** OWASP ASVS 5.0 principles and OWASP guidance for web and LLM applications  
**Last updated:** August 31, 2026

## 1. Scope

This threat model covers the public Tankroy Systems Inc. website, the embedded and full-page TankFit AI advisor, the Customer Experience and Sales Team Experience routes under the Demo Hub, anonymous demo sessions, prepared sales fixtures, the session-scoped sales workspace, conversational AI routing, deterministic tools, Neon Postgres, on-demand proposal generation, simulated checkout, Demo Staff Mode, and the Vercel deployment boundary.

The MVP intentionally excludes user file uploads, arbitrary remote-URL ingestion, XML input, operating-system command execution, dynamically loaded user templates, real payments, real customer data, and a public general-purpose administration area. Adding any excluded capability requires updating this threat model before implementation.

No application can promise protection against every future attack. The goal is to reduce attack surface, apply layered controls, test the controls, monitor failures, and fail safely.

## 2. Assets to Protect

- AI-provider and database credentials
- Anonymous session integrity and isolation
- Demo approval tokens
- Catalog and compatibility integrity
- Fictional price, stock, lead-time, order, payment, and approval state
- Proposal artifacts
- Audit records
- Provider quotas and free-tier availability
- Source code and deployment configuration

## 3. Trust Boundaries

The following are always untrusted:

- Visitor text, form fields, headers, cookies, route parameters, and query parameters
- AI-provider responses and tool arguments proposed by a model
- Catalog source notes rendered in the interface
- Data returned from external providers
- Proposal content derived from conversation text
- Pull-request code and third-party dependencies until reviewed and validated

The browser is not an authorization boundary. Every permission and state transition must be rechecked on the server.

The public Tankroy surface, `/demo/customer`, and `/demo/sales` are presentation boundaries, not independent security domains. Public routes may browse descriptive catalog data and start an advisor session, but they must not expose order mutation, approval, audit, staff-role, provider, database, or cross-session controls. `/demo/sales` may show mutation controls only after the current session has explicitly obtained a valid, short-lived `Demo Staff Mode` token. Selecting a mode or navigating directly to a route cannot grant authority. A production staff deployment would add authenticated identity and authorization rather than treating the demo token as employee authentication.

## 4. Security Principles

1. Eliminate unnecessary capabilities before filtering dangerous input.
2. Validate on the server using positive schemas and strict size limits.
3. Keep data separate from executable instructions.
4. Authorize every object and action, not only every route.
5. Give the agent and database the least privilege necessary.
6. Fail closed for transactional state, approval, and artifact access.
7. Treat WAF and model guardrails as defense in depth, not primary authorization.
8. Log security-relevant outcomes without logging secrets or unnecessary personal content.

## 5. Threat and Control Matrix

| Threat | Exposure in TankFit AI | Preventive controls | Required verification |
| --- | --- | --- | --- |
| Prompt injection and tool manipulation | Public chat can contain instructions to ignore rules, reveal secrets, alter price, approve orders, or call unauthorized tools | Narrow tool schemas; deterministic authorization inside every tool; no secrets in model context; provider output treated as data; model cannot mutate approval or payment; explicit catalog and session scope; output schema validation | Adversarial prompt suite verifies that injected instructions cannot change tools, catalog facts, session scope, price, order, payment, or approval |
| Broken access control and IDOR | Anonymous visitors could guess another session, order, or proposal identifier | Cryptographically random opaque IDs; every query scoped to session; signed role token scoped to session, order, purpose, and expiry; no public admin listing; generic not-found responses | Two-session integration tests attempt cross-read, cross-write, cross-approval, replay, and artifact download |
| Customer/staff surface confusion | A public Tankroy page could accidentally expose order, approval, audit, or staff controls, or a demo label could be mistaken for production authorization | Separate route and navigation contracts; public components receive no staff actions; server-side authorization on every mutation; explicit synthetic and demo-role labels; no general staff listing; surface-specific E2E tests | Anonymous browser tests inspect public pages for forbidden controls and attempt direct staff mutations without a scoped token |
| Prepared fixture isolation failure | A direct Sales Team Experience could reuse a global order, inherit another session's state, or bypass recommendation and commercial validation | No fixture creation on `GET`; explicit same-origin Server Action; new opaque session-owned records; normal deterministic and current commercial validation; provenance audit event; idempotency guard; no shared mutable opportunity | Two-session tests create prepared fixtures concurrently, attempt cross-read and cross-approval, verify distinct identifiers and provenance, and confirm normal validation failures remain enforced |
| SQL injection | Free text and identifiers reach database-backed flows | Drizzle parameter binding; no concatenated SQL; prohibit user-influenced `sql.raw`; schema validation; least-privileged application role; migrations use a separate role | Unit and integration tests with injection payloads; static check for prohibited raw-query sinks; review generated SQL where necessary |
| Stored, reflected, and DOM XSS | Chat messages, model output, catalog notes, audit reasons, and proposal fields are rendered | React text escaping; sanitized allowlisted Markdown if Markdown is enabled; no raw HTML; prohibit unsanitized `dangerouslySetInnerHTML`; contextual encoding in HTML and PDF; restrictive CSP | Render malicious HTML, URI, SVG, and Markdown fixtures; verify no script, event handler, unsafe URL, or markup execution |
| CSRF | Cookies accompany state-changing Server Actions and Route Handler requests | No mutations through GET; host-only `SameSite` cookies; Next.js same-origin Server Action checks; server authorization on every action; Origin and Fetch Metadata verification for state-changing Route Handlers; session-bound CSRF token when a route cannot rely on framework protection | Cross-origin POST tests, missing/invalid Origin tests, missing token tests where applicable, and confirmation that safe navigation remains usable |
| OS command injection | PDF generation or future tooling could be implemented through a shell | Do not invoke shells or `child_process`; use in-process libraries and managed APIs; never evaluate user or model text | Static prohibition of command-execution imports and dynamic code evaluation in runtime source |
| Path traversal and LFI/RFI | Proposal downloads and local product assets involve resource identifiers | No user-supplied filesystem path; product paths come from the versioned catalog; an opaque proposal identifier maps through session-scoped database metadata to in-process generation; fixed templates are compiled with the application | Encoded traversal and absolute-path tests against download and asset routes; unknown IDs return generic not found |
| SSRF | Server calls AI providers and managed services | Provider endpoints are configured server-side; no arbitrary URL, redirect target, webhook destination, or model-proposed host; outbound allowlist; reject private, loopback, link-local, file, and non-HTTPS destinations if a URL feature is ever added | Tool tests attempt alternate schemes, redirects, IP literals, localhost, private ranges, and cloud metadata addresses |
| XXE | No XML is needed by the MVP | Reject XML content types; do not install or invoke XML parsers; accept strict JSON for public APIs | Unsupported-media-type tests for XML and entity payloads; dependency review detects newly introduced XML parsing |
| File upload abuse | Uploads could enable malicious content, decompression bombs, traversal, or malware | No public file upload in the MVP; product images are reviewed repository assets; proposal files are generated by the application | Route inventory confirms no upload endpoint; any future upload feature requires a new threat-model section and ADR |
| Insecure deserialization, mass assignment, and prototype pollution | JSON bodies and model-generated objects can contain unexpected fields or nested structures | Strict schemas; maximum nesting and collection sizes; reject or deliberately strip unknown keys; map allowed fields explicitly; never merge untrusted objects into configuration or prototypes | Tests for unknown keys, `__proto__`, `constructor`, deep nesting, oversized arrays, numeric overflow, and invalid enums |
| Open redirect and unsafe URL handling | Future navigation or provider error links could be attacker controlled | Use relative application routes or an exact redirect allowlist; never reflect an arbitrary URL into `Location` | Tests for protocol-relative, encoded, mixed-case, and external redirect values |
| Clickjacking and browser capability abuse | Approval actions could be framed or tricked | CSP `frame-ancestors 'none'`; legacy `X-Frame-Options: DENY`; restrictive Permissions Policy; explicit role and approval interaction | Header tests and browser attempt to embed approval flow in an iframe |
| CORS misconfiguration | Credentialed routes could be exposed cross-origin | Same-origin by default; no wildcard origin with credentials; exact controlled origin allowlist only if a documented integration is added | Preflight tests from allowed and disallowed origins |
| Denial of service and cost exhaustion | Public chat, provider calls, database sessions, and PDF generation consume finite free-tier resources | Body and message limits; timeouts; concurrency limits; per-IP, per-session, and global quotas; provider daily caps; circuit breakers; 24-hour expiry; deterministic fallback; Vercel platform DDoS protection; staged WAF rules when available | Load and abuse tests verify `429`, timeouts, capped retries, bounded generation, cleanup, and no unbounded session growth |
| Secret exposure and log injection | Errors, prompts, provider responses, or malicious newlines could leak or forge logs | Server-only modules; no `NEXT_PUBLIC_` secrets; allowlisted structured log fields; newline normalization; redaction; generic client errors; no full prompt logging by default | Secret scanning; error-path tests; inspect browser bundles and logs for test canaries |
| Supply-chain compromise | npm and GitHub Actions dependencies execute during build and CI | Minimal dependencies; lockfile; automated update review; pinned major action versions; dependency and code scanning; no install scripts unless reviewed; least-privileged workflow permissions | CI review, dependency audit, Dependabot, CodeQL after application scaffolding, and release checklist |

## 6. Request Security Baseline

Every state-changing Server Action or Route Handler must:

1. Accept only an allowlisted HTTP method and expected content type.
2. Enforce a small body-size limit before expensive parsing or provider calls.
3. Parse through a strict server-side schema.
4. Resolve the current server-managed session.
5. Authorize the specific resource and intended state transition.
6. Enforce same-origin or documented CSRF protection.
7. Apply rate and cost limits before invoking external providers.
8. Return a generic error to the client and a structured, redacted event to logs.

Creating a prepared Sales Team Experience opportunity is a state-changing action and follows this complete baseline. It cannot be triggered by page rendering, a `GET` request, a query parameter, or model output.

Server Actions are public endpoints even when invoked only by application components. They require the same input validation and authorization as Route Handlers.

## 7. Browser Security Baseline

The application will define and test:

- An enforced nonce-based Content Security Policy with no browser access to AI-provider or database origins
- `frame-ancestors 'none'` and `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- A restrictive `Permissions-Policy`
- HTTPS-only transport and HSTS in production
- Host-only cookies using the `__Host-` prefix, `Secure`, `HttpOnly`, `SameSite`, and `Path=/`

Any third-party origin added to CSP must have a documented product need. AI-provider calls occur on the server and do not require browser CSP exceptions.

## 8. Agent and Tool Boundary

- Tools accept typed identifiers and structured fields, never free-form SQL, paths, commands, or URLs.
- The tool implementation derives session scope from the server, not from a model-provided session ID.
- Compatibility and commerce tools return bounded structured data.
- The model cannot discover the full database, enumerate sessions, change provider configuration, or select a new endpoint.
- Tool results are treated as untrusted before rendering and are minimized before returning to the model.
- Instructions found in user text, catalog notes, or provider output cannot change the tool allowlist.

Prompt injection cannot be eliminated solely through a system prompt. Security depends on ensuring that a successful behavioral manipulation still lacks the authority to perform a forbidden action.

## 9. File and Proposal Boundary

- The MVP accepts no uploads.
- Product images are local, reviewed, immutable release assets.
- Proposals are produced from fixed application templates using escaped values.
- Proposal identifiers are generated by the server and never constructed from a filename supplied by the visitor or model.
- Downloads require current-session authorization and an unexpired artifact record.
- Responses set a fixed safe content type, `nosniff`, and a sanitized server-generated filename.

## 10. Platform and Firewall Layer

Vercel's platform DDoS mitigation provides an outer layer. Application-level quotas remain mandatory because syntactically valid requests can still exhaust AI or database resources.

When real traffic exists, proposed WAF rules must follow this rollout:

1. Log only.
2. Review matches and false positives.
3. Enforce on preview.
4. Observe production in log mode.
5. Enforce conservatively in production.

Chat, proposal generation, and approval endpoints require different limits. Limits must start above observed legitimate traffic and be tightened from evidence rather than guesswork.

## 11. Verification and Release Gate

Before public release:

- Threat controls have linked automated or manual tests.
- The AirFlame happy path still works with security controls enabled.
- Public Tankroy pages do not expose staff controls, and direct calls to workspace mutations fail without a valid session-scoped role token.
- Demo mode selection grants no role; prepared AirFlame opportunities are session-private, explicitly created, normally validated, and distinguishable in the audit trail.
- A custom-scenario adversarial suite covers web and prompt-injection payloads.
- Cross-session tests pass.
- Dependency, code, and secret scans have no unresolved critical or high finding.
- The enforced CSP is verified for hydration, navigation, Server Actions, and proposal download.
- A staging dynamic scan is reviewed; automated scanner output is not accepted without triage.
- Security headers and cookies are verified on the deployed production URL.
- Rate-limit and provider-quota failure behavior is exercised.
- An incident and rollback procedure is documented.

### 11.1 Conversational Fallback Implementation Map

The initial conversational milestone maps the controls above to executable code and tests:

- `src/app/api/advisor/route.ts` accepts only bounded same-origin JSON requests, applies a request limit before provider work, validates a strict schema, and recalculates compatibility on the server.
- `src/lib/ai/provider-router.ts` keeps credentials server-only, gives the model no mutation tools, treats the complete browser transcript as untrusted data, limits each provider to one bounded attempt, and ends in deterministic guided mode.
- `src/lib/ai/prompt.ts` restricts conversation scope, grounded product evidence, language behavior, sensitive-data requests, and authoritative safety or installation advice. The prompt is defense in depth and grants no authority.
- React renders provider output as escaped plain text; raw HTML and Markdown execution are not enabled.
- `src/lib/ai/types.test.ts`, `request-security.test.ts`, `rate-limit.test.ts`, and `provider-router.test.ts` verify input bounds, unknown-field rejection, same-origin enforcement, content-type and body limits, per-instance request limiting, sequential fallback, circuit breaking, deterministic terminal behavior, and untrusted transcript handling.

The short burst limiter and circuit breaker apply to one warm application instance. Postgres-backed daily budgets cap advisor and discovery AI requests across all Vercel instances; staged Vercel Firewall rules remain release hardening for meaningful public traffic.

The public widget, `/advisor`, `/demo/customer`, and `/demo/sales` must use the same server-managed session scope. A client-controlled route, query parameter, or widget state cannot promote a visitor to staff mode, select another order, or mark an opportunity as prepared.

## 12. Residual Risks

- Novel prompt injection may influence wording even though deterministic authority remains constrained.
- Anonymous IP-based limits can affect shared networks and can be bypassed by distributed attackers.
- Free-tier provider behavior and security posture are external dependencies.
- Generated proposals may repeat malicious-looking text as escaped inert content.
- WAF rules can create false positives; staged rollout and monitoring are required.

## 13. Primary References

- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP LLM Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [OWASP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)
- [OWASP Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Cross-Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Server-Side Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP OS Command Injection Defense](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
- [OWASP XML External Entity Prevention](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)
- [Next.js Data Security Guide](https://nextjs.org/docs/app/guides/data-security)
- [Vercel Firewall](https://vercel.com/docs/vercel-firewall)
