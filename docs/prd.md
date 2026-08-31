# Product Requirements Document: TankFit AI

| Field | Value |
| --- | --- |
| Product | TankFit AI |
| Version | 0.8 |
| Status | Public-experience revision approved for implementation |
| Date | August 31, 2026 |
| Owner | Davi Almeida |
| Product type | Public portfolio prototype |

## 1. Executive Summary

TankFit AI is the embedded, AI-assisted solution advisor on the fictional **Tankroy Systems Inc.** public website. Tankroy sells remote tank-monitoring solutions to fuel distributors, industrial operators, farms, utilities, and other businesses that store liquids, gases, or solids. The same Next.js application also provides a deliberately separated sales workspace for reviewing a synthetic opportunity.

Customers frequently understand their operational problem but do not know which sensor, connectivity option, mounting method, or service model they need. TankFit AI turns an informal description of that problem into a technically compatible product recommendation, a transparent ROI estimate, a draft order, and a simulated proposal.

The AI manages the conversation and explains recommendations. Deterministic application code controls compatibility, product specifications, availability, pricing, calculations, approval requirements, and order state. No real payment, binding quote, valid technical certification, or legally effective document is produced.

All companies, people, products, data, prices, inventory, transactions, and documents in this project are fictional. This is an independent personal project created by Davi Almeida using exclusively synthetic information for the Jornada de Dados competition.

## 2. Fictional Business Case

### 2.1 The Business

**Tankroy Systems Inc.** is a fictional Ottawa-based provider of remote tank-monitoring hardware and subscription services. Its product catalog includes cellular and Bluetooth monitoring devices using float gauges, radar, hydrostatic pressure, scales, and other measurement methods.

Tankroy Systems sells to organizations across Canada and the United States. Each sale requires a consultative conversation because compatibility depends on the stored material, tank type, existing instrumentation, operating environment, connectivity, reporting needs, and business objective.

### 2.2 The Client

**Maya Chen**, Director of Sales and Operations at Tankroy Systems, commissioned the product concept. Her sales team spends significant time qualifying incomplete requests, asking repetitive technical questions, and correcting customers who initially select an incompatible product.

Maya wants customers to receive useful guidance at any time without allowing an AI model to invent specifications, prices, inventory, certifications, or safety claims. She also requires a staff member to approve every final proposal before it is issued.

### 2.3 The Product

**Tankroy Systems Inc.** is the fictional customer-facing brand. Its website provides the catalog, product information, solution context, and entry points to the advisor.

**TankFit AI** is the embedded public solution advisor and full-page `/advisor` experience. Its conversational style is clear, practical, neutral, and cautious. It asks only questions that materially affect the recommendation and explains why each question matters when necessary.

The same application includes a Demo Hub with separate Customer Experience and Sales Team Experience modes. Customer Experience demonstrates the public Tankroy website and TankFit AI chatbox. Sales Team Experience represents a fictional Tankroy solution specialist reviewing requirements, order state, approval evidence, and a synthetic proposal. In the anonymous MVP, sales mutations remain protected by the existing session-scoped `Demo Staff Mode`, not by a general public staff account.

## 3. Problem Statement

Prospective customers often arrive with a business problem rather than a product name. Examples include:

- "We need to prevent heating-oil run-outs across 500 residential tanks."
- "We want to monitor water levels in remote storage tanks without manual inspections."
- "We distribute industrial gases and need better visibility into customer inventory."
- "We already have float gauges but do not know which telemetry device is compatible."

A conventional product catalog requires these customers to understand technical categories before they can make progress. A general-purpose chatbot may provide a smoother conversation but creates unacceptable risks if it fabricates compatibility, pricing, stock, safety guidance, or certifications.

Tankroy Systems needs a guided sales experience that combines natural-language discovery with deterministic product and transaction controls.

## 4. Product Vision

Enable a prospective customer to move from an uncertain operational need to an explainable, technically valid draft solution in one guided session, while keeping every consequential decision under deterministic code or human control.

## 5. Goals

### 5.1 Customer Goals

- Describe an application in natural language without knowing product terminology.
- Understand which fictional monitoring solution best fits the stated requirements.
- See the evidence and constraints behind each recommendation.
- Compare a primary recommendation with compatible alternatives.
- Estimate potential operational value using explicit, editable assumptions.
- Configure a fictional demo kit or draft order.
- Complete a simulated checkout and receive a non-binding proposal after staff approval.

### 5.2 Business Goals

- Capture more complete and consistently structured sales requirements.
- Reduce repetitive early-stage qualification work.
- Prevent incompatible products from entering a proposal.
- Demonstrate a repeatable, auditable pre-sales process.
- Collect aggregate, synthetic usage signals about common customer needs.

### 5.3 Portfolio Goals

- Demonstrate an end-to-end AI sales workflow rather than a generic chatbot.
- Demonstrate safe tool use, provider fallback, deterministic business rules, human approval, observability, testing, and deployment.
- Remain publicly testable with no required payment from the project author or visitor.

## 6. Non-Goals

The MVP will not:

- Represent, integrate with, or replace any real organization's product, website, portal, catalog, API, or internal system.
- Scrape an authenticated shop or use non-public product, customer, pricing, inventory, or operational data.
- Accept real customer data, real card details, or real payments.
- Produce a binding quote, purchase order, contract, certification, engineering design, or legally valid document.
- Provide installation, hazardous-location, regulatory, or safety advice that should come from a qualified professional.
- Optimize real delivery routes or forecast consumption from real telemetry.
- Guarantee production-grade uptime or a commercial service-level agreement.
- Support every tank, material, geography, or monitoring method in the first release.

## 7. Target Users

### 7.1 Primary Persona: Operations Manager

**Name:** Jordan Blake  
**Organization:** AirFlame Fuels, a fictional regional heating-fuel distributor  
**Need:** Reduce run-outs and unnecessary deliveries across hundreds of customer tanks  
**Knowledge:** Understands operations and customer service but not sensor-selection details  
**Success:** Leaves with a credible recommended configuration, ROI assumptions, and proposal request

### 7.2 Secondary Persona: Industrial Facility Manager

**Name:** Priya Nair  
**Organization:** AgricuFlow Cooperative, a fictional operator of remote agricultural sites  
**Need:** Replace manual water-tank inspections and receive reliable level alerts despite inconsistent connectivity  
**Knowledge:** Understands site operations but needs guidance on measurement methods and connectivity  
**Success:** Identifies compatible monitoring categories and the questions requiring technical review

### 7.3 Internal Persona: Sales Approver

**Name:** Alex Tremblay  
**Role:** Tankroy Systems solution specialist  
**Need:** Review the customer's requirements, recommendation evidence, assumptions, and draft order  
**Success:** Approves, rejects, or requests changes without reconstructing the entire conversation

## 8. MVP Scope

### 8.1 Supported Application Categories

The MVP will support six fictional categories:

1. Propane
2. Heating oil
3. Refined fuels
4. Lubricants
5. Water
6. Industrial gases

### 8.2 Fictional Catalog

The catalog will contain approximately 10-15 fictional products. Each product will have structured attributes such as:

- Product ID and name
- Product image
- Measurement method
- Supported materials
- Supported tank types
- Connectivity
- Existing gauge or probe compatibility
- Operating-environment constraints
- Installation method
- Reporting and alert capabilities
- Fictional stock quantity and availability status
- Estimated delivery lead time in business days
- Fictional price or service-plan value
- Source notes and last-reviewed date

The primary catalog will be stored in the application database. A read-only JSON copy and static product images will provide a resilient catalog fallback.

### 8.3 Channels and Experience Surfaces

The MVP is one responsive public web application with two intentionally separated surfaces:

1. **Public Tankroy website:** home, use cases, catalog, product details, and an embedded TankFit AI assistant. Anonymous visitors can browse without an account and start a custom or preset discovery flow.
2. **Demo Hub:** an explicitly labeled `/demo` entry point lets evaluators choose Customer Experience or Sales Team Experience.
3. **Sales workspace:** requirements review, deterministic evidence, draft order, simulated checkout, approval, audit, and proposal generation. The public competition build exposes this through `/demo/sales`; state-changing staff controls still require session- and order-scoped `Demo Staff Mode`.

Both surfaces share one Next.js deployment, database, catalog, compatibility engine, provider router, and security boundary. They are not separate products or backends. Telegram, WhatsApp, native mobile applications, a CMS, and a real authenticated staff portal are future possibilities, not MVP requirements.

### 8.4 Entry Modes

The public Tankroy landing page will provide two equally valid ways to begin:

1. **Sample scenario:** select one of the three editable presets in Section 20.
2. **Custom scenario:** describe a new fictional organization and operational need in free text.

The presets are onboarding aids, portfolio demonstrations, and repeatable test fixtures. They do not limit the application to three customers or three exact conversations. Custom scenarios may vary freely within the six supported application categories and the deterministic catalog. Requests outside that supported universe must return an honest `out_of_scope` or `technical_review_required` result rather than an invented solution.

## 9. End-to-End User Journey

1. The visitor opens the public Tankroy website without creating an account.
2. The application clearly states that the company, products, data, prices, and transaction are fictional.
3. The visitor browses the catalog or opens the floating `Ask TankFit AI` assistant from a public page.
4. The visitor describes a custom fictional operational need in natural language or selects and optionally edits a sample scenario.
5. TankFit AI asks targeted discovery questions until the minimum compatibility fields are complete.
6. The rules engine filters the catalog and returns only compatible products.
7. The AI explains the primary recommendation, constraints, evidence, and compatible alternatives.
8. The visitor adjusts operational assumptions and views a deterministic ROI estimate.
9. In Customer Experience, the visitor configures a demo kit or draft order.
10. The application validates price, fictional availability, compatibility, and required fields again.
11. The visitor completes a simulated payment or checkout step using test data only.
12. The order enters `pending_approval`; no final proposal is issued yet.
13. The visitor returns to the Demo Hub and opens Sales Team Experience with the same session-scoped opportunity.
14. The visitor explicitly enters `Demo Staff Mode` using a short-lived signed token restricted to the current synthetic session and order.
15. Acting as a fictional Tankroy Systems solution specialist, the visitor reviews the conversation summary, requirements, recommendation, assumptions, and order.
16. The demo approver approves, rejects, or requests changes; the role change and decision are recorded in the audit timeline.
17. After approval, the application generates a clearly marked, non-binding proposal document.
18. The visitor returns to Customer Experience, checks the final status, and downloads the simulated proposal.
19. The anonymous demo session and its generated artifacts expire automatically after 24 hours.

An evaluator may also open the Demo Hub first. Customer Experience starts the public journey. Sales Team Experience either continues the evaluator's current synthetic opportunity or, after an explicit action, creates a private AirFlame fixture in that evaluator's own session. A prepared fixture is never a shared mutable customer or a shortcut around deterministic validation.

## 10. Functional Requirements

### FR-1: Conversational Discovery

- The system must accept a free-text description of the customer's application.
- The system must extract structured requirements from the conversation.
- The system must ask for missing fields that affect compatibility.
- The system should avoid asking questions that do not affect the MVP decision.
- The visitor must be able to review and edit the extracted requirements.
- The system must support custom fictional scenarios that are not pre-associated with AirFlame Fuels, AgricuFlow Cooperative, or Boreal Beverage Group.
- The system must classify unsupported materials or applications as `out_of_scope` and incomplete or uncertain supported applications as `technical_review_required`.

### FR-2: Deterministic Compatibility

- Product compatibility must be decided by application code against structured catalog attributes.
- The language model must not add a product to the compatible set.
- If no product matches, the system must state that technical review is required.
- Every recommendation must identify the matching requirements and any unresolved constraints.

### FR-3: Grounded Product Information

- Product names, capabilities, prices, stock quantities, delivery lead times, availability, and constraints must come from deterministic catalog and inventory records.
- AI-generated statements about a product must be traceable to catalog fields or approved source notes.
- Unsupported claims must be blocked or omitted.
- The interface must display the last-reviewed date for technical product information.

### FR-4: Recommendation Experience

- The system must present one primary recommendation when a unique best fit exists.
- The system may present up to two compatible alternatives.
- The explanation must distinguish facts, assumptions, and recommendations.
- The visitor must be able to inspect product details and images.

### FR-5: ROI Estimator

- ROI calculations must be implemented in deterministic code.
- Inputs and assumptions must be visible and editable.
- Outputs must include the calculation method and a disclaimer.
- The AI may explain the result but must not alter calculated values.

### FR-6: Draft Order

- The visitor must be able to add compatible products and fictional services to a draft order.
- Price, stock quantity, availability, and delivery lead time must be revalidated against the application database when the order is created.
- The system must reject incompatible or unavailable items even if requested through the chat.
- The visitor must be able to edit quantities before submission.

### FR-7: Simulated Checkout

- The system must never accept or request real card information.
- Checkout must use a provider sandbox or an internal mock-payment adapter.
- All checkout screens must state that no money will move.
- A successful simulation must create an auditable payment event linked to the draft order.

### FR-8: Human Approval

- Final proposal generation must require approval by an authorized fictional staff user.
- The agent must not be able to approve its own recommendation or order.
- The approver must see the structured requirements, evidence, unresolved issues, ROI assumptions, order, and audit timeline.
- Approval, rejection, and change requests must record actor, timestamp, and reason.
- In the public demo, the visitor may explicitly assume the `demo_approver` role only for the visitor's current synthetic session.
- Demo approval authorization must use a short-lived, server-signed token and must never expose another visitor's session or a general administrative dashboard.
- A production implementation would require a separately authenticated staff member; public role simulation is a portfolio-demo mechanism only.

### FR-9: Proposal Generation

- The system must generate the proposal only after approval.
- The document must be marked `DEMO - NOT A VALID QUOTE OR CONTRACT` on every page.
- The proposal must include the requirements, recommended configuration, assumptions, fictional pricing, and approval record.

### FR-10: Preset and Custom Demo Scenarios

- The landing page must offer the three approved prebuilt scenarios defined in Section 20.
- The landing page must also offer a clearly visible `Describe your own situation` entry path.
- Preset fields must remain editable and must pass through the same discovery, compatibility, commerce, approval, and audit rules as custom scenarios.
- A custom scenario must not receive hidden compatibility advantages or hard-coded answers derived from a preset.
- A visitor must be able to complete the experience without entering personal information.
- Sample personas and test checkout values must be available in the interface.
- The visitor must be able to simulate the complete customer, checkout, approval, and proposal journey.
- The role-switching interface must clearly state which fictional role is active.
- Public demo access must be scoped to the current session and must not expose cross-session data.

### FR-11: Public Tankroy Website

- The root experience must be understandable as a fictional Tankroy Systems Inc. customer website before a visitor starts a conversation.
- Public pages must explain the fictional business, supported use cases, catalog categories, and the purpose of TankFit AI using grounded synthetic content.
- The public catalog and product-detail pages must display reviewed product images, immutable identifiers, relevant compatibility facts, and an `Ask TankFit AI` entry point.
- Public pages must not expose order mutation, approval, audit, staff-role, provider, database, or cross-session controls.
- A visitor must be able to browse descriptive content without creating a database-backed session; a session may begin when the advisor or guided journey is opened.
- The public surface must work on desktop and mobile, and the assistant entry point must be keyboard accessible.

### FR-12: Sales Workspace Surface

- The guided workspace must present structured requirements, recommendation evidence, ROI assumptions, commercial validation, order state, approval state, audit events, and proposal eligibility in a clear sequence.
- The competition MVP must label `/demo/sales` as Sales Team Experience and require explicit entry into session-scoped `Demo Staff Mode` before approval actions appear.
- Staff actions must be explicit interface mutations checked on the server; the conversational agent must not approve, authorize payment, or generate a proposal.
- A future production staff surface may use separate authentication and authorization, but that is not required for the anonymous competition MVP.

### FR-13: Demo Hub and Experience Selection

- `/demo` must explain the two fictional perspectives and offer `Experience the Customer Journey` and `Experience the Sales Team Workspace` as distinct choices.
- `/demo/customer` must exercise the same public Tankroy components, embedded TankFit AI behavior, catalog, session, and deterministic domain pipeline as the normal customer surface.
- `/demo/sales` must show only the current anonymous session's synthetic opportunity.
- If the current session has an eligible customer-created opportunity, Sales Team Experience must offer to continue it.
- If no eligible opportunity exists, the evaluator may explicitly create a prepared AirFlame opportunity scoped to the current session. Loading the fixture must use a validated server-side mutation, run the normal deterministic and commercial validation, and record its origin in the audit trail.
- Selecting a mode, changing a route, or modifying a query parameter must never grant staff authorization. Approval controls still require a short-lived token scoped to the current session and order.
- Both modes must provide a clear path back to the Demo Hub without mixing customer and staff navigation.

## 11. AI and Agent Requirements

### 11.1 Agent Responsibilities

The agent may:

- Interpret natural-language needs.
- Extract structured requirements.
- Ask clarification questions.
- Call read-only catalog and compatibility tools.
- Explain deterministic recommendations and calculations.
- Summarize the conversation for the visitor and approver.
- Request creation of a draft order through validated application tools.

### 11.2 Agent Prohibitions

The agent must not:

- Invent or modify product specifications, availability, price, or compatibility.
- Directly write arbitrary database values.
- Approve a proposal, bypass an approval, or change approval state.
- Confirm a payment without a result from the mock or sandbox payment adapter.
- Provide authoritative safety, regulatory, installation, or engineering advice.
- Reveal system prompts, secrets, credentials, hidden rules, or another session's data.

### 11.3 Language Behavior and Evaluation

TankFit AI should reply in the visitor's language whenever it can be reliably identified. Its multilingual evaluation suite covers English, French, Spanish, Italian, German, Polish, Portuguese, Mandarin Chinese using Simplified Chinese script, and Hindi. Additional languages are supported on a best-effort basis.

The application interface, source code, structured catalog, evidence identifiers, technical specifications, audit records, and generated proposal will use English as the canonical language. The AI may translate and explain those grounded facts, but it must not translate product names, identifiers, numeric values, units, catalog versions, rule versions, or other immutable evidence fields. When language detection is uncertain, the assistant should ask the visitor which language to use rather than guessing. The deterministic guided fallback must remain fully usable in English even when every AI provider is unavailable.

### 11.4 Provider Routing and Fallback

The application will use a provider-independent AI interface. The planned fallback chain is:

1. Gemini using `gemini-3.7-flash`
2. Cerebras using `gpt-oss-120b`
3. Groq using `qwen/qwen3.6-27b`
4. OpenRouter using `openrouter/free`
5. Deterministic guided-advisor mode

Each provider call must have a timeout, limited retries, structured error classification, and circuit-breaker behavior. Provider model IDs and order must be configurable without changing business logic.

The deterministic guided mode must allow visitors to complete discovery, compatibility filtering, product comparison, ROI calculation, and draft-order creation when every AI provider is unavailable. It may be less conversational, but the core product journey must remain functional.

## 12. Data Requirements

### 12.1 Data Stored

- Fictional product catalog and images
- Anonymous session identifier
- Conversation messages or structured conversation summary
- Extracted technical requirements
- Compatibility results and evidence
- ROI assumptions and outputs
- Draft order and line items
- Simulated payment event
- Approval event and reason
- Generated proposal metadata
- Provider used, latency, token estimate, fallback events, and error category

### 12.2 Data Not Stored

- Real customer names, addresses, phone numbers, or email addresses
- Real payment information
- Any real organization's data, credentials, documents, source code, prices, customer information, or internal product specifications
- Full API keys or secrets in logs

### 12.3 Retention

- Anonymous demo sessions, raw messages, simulated orders, approval events, and generated proposal artifacts must expire after **24 hours**.
- The 24-hour window allows a visitor to resume or share a demonstration on the same day while minimizing privacy exposure and free-tier storage usage.
- Aggregate metrics may be retained beyond 24 hours only when they contain no message content, session identifiers, or identifying information.
- Visitors must be able to reset their session.

## 13. Privacy and Security Requirements

- The interface must tell visitors not to enter real personal, confidential, or safety-sensitive information.
- All user, catalog-note, provider, and model output must be treated as untrusted data.
- Every public input must be validated against an explicit server-side schema with type, enum, format, length, depth, and collection-size limits; unknown fields must be rejected or discarded deliberately.
- API keys must exist only in server-side environment variables.
- The browser must never call an AI provider with a secret project key.
- Public pages and the sales workspace must be separate presentation surfaces with server-side authorization; hiding a control in the browser is not authorization.
- Public endpoints must implement per-IP and global rate limits.
- Database queries must use parameterized Drizzle operations, avoid user-influenced raw SQL, follow least privilege, and remain scoped to the current session or authorized staff user.
- Public demo approval endpoints must validate a short-lived signed token scoped to the current session and order.
- General staff or administrative routes must not be publicly exposed; a future production implementation would require separate authentication and authorization.
- Logs must redact secrets and potential personal information.
- AI providers should receive only the minimum normalized context necessary for the current task.
- Prompt-injection attempts must not change tool permissions, provider configuration, deterministic business rules, authorization, or access to secrets and other sessions.
- AI tool inputs and structured outputs must be schema-validated; the model must never construct executable SQL, file paths, shell commands, import names, provider URLs, or approval actions.
- User and AI content must render as escaped text or sanitized allowlisted Markdown; raw HTML and unsanitized `dangerouslySetInnerHTML` are prohibited.
- State-changing requests must use non-GET methods, verify session authorization, enforce same-origin requests, and use framework CSRF protections plus explicit Origin or Fetch Metadata checks where Route Handlers are used.
- Session cookies must be `HttpOnly`, `Secure`, `SameSite`, host-only, short-lived, and rotated when entering or leaving Demo Staff Mode.
- The application must not fetch arbitrary user-provided URLs. Outbound requests must target an explicit allowlist of configured AI-provider and managed-service origins.
- The MVP must not execute operating-system commands, dynamically evaluate user or model text, load code or templates from user-controlled paths, accept user file uploads, or parse XML.
- Proposal downloads must resolve an opaque server-generated artifact identifier through session-scoped database metadata; user input must never become a local or object-storage path.
- A restrictive Content Security Policy and security headers must mitigate XSS, clickjacking, MIME sniffing, unsafe framing, excessive browser permissions, and referrer leakage.
- CORS must be denied by default; any future exception must name exact controlled origins and must not use wildcard origins with credentials.
- Security controls and tests will be mapped to the maintained project threat model and an appropriate OWASP ASVS 5.0 baseline.

## 14. Observability and Cost Controls

The system must record:

- Provider and model selected
- Provider attempts and fallback reason
- Request latency and outcome
- Estimated input and output tokens when available
- Compatibility-rule version
- Catalog version
- Tool calls and validation results
- Order, approval, payment, and proposal state transitions

Cost and availability controls must include:

- Free-tier providers only for the public MVP
- Per-IP rate limiting
- Global daily request caps per provider
- Maximum input and output sizes
- Response and catalog caching where safe
- Circuit breakers for unavailable providers
- Deterministic mode when AI quotas are exhausted

## 15. Success Metrics

### 15.1 Primary Metric

**Qualified recommendation completion rate:** percentage of started supported sessions that reach a compatible recommendation or an explicit `technical_review_required` outcome with all mandatory discovery fields captured.

Target for the public MVP: **80% or higher** across the three presets and a maintained custom-scenario evaluation set.

### 15.2 Quality Guardrails

- **Compatibility-rule accuracy:** 100% across the maintained test fixture set.
- **Unsupported catalog claims:** zero in the release evaluation set.
- **Approval-gate enforcement:** 100% of final proposals require a recorded approval.
- **Real-payment attempts:** zero accepted.
- **Core journey availability:** deterministic mode completes the core journey when all AI providers are disabled.
- **Recommendation traceability:** 100% of recommendations identify their catalog evidence and rule result.

### 15.3 Experience Metrics

- Median time to first useful response: under 4 seconds under normal provider availability.
- Median number of discovery questions: six or fewer for a prebuilt scenario.
- Draft-order completion rate: 50% or higher for visitors who reach a recommendation in usability testing.

## 16. MVP Acceptance Criteria

The MVP is ready for public release when:

1. A visitor can complete at least three end-to-end fictional scenarios on the deployed website.
2. The catalog contains at least ten fictional products with consistent images and structured compatibility attributes.
3. Compatibility tests cover every supported material and measurement method.
4. Product facts, price, stock quantity, delivery lead time, availability, calculations, and order state come exclusively from deterministic sources.
5. At least two AI providers and the deterministic fallback have been tested successfully.
6. Disabling every AI key still leaves a usable guided recommendation and draft-order flow.
7. A simulated checkout produces no real transaction.
8. A proposal cannot be generated without a recorded human approval.
9. The audit view reconstructs the major decisions and state transitions of a session.
10. A public visitor can complete the customer flow, enter session-scoped Demo Staff Mode, approve or reject the order, return to the customer view, and download an approved proposal.
11. Demo Staff Mode cannot read, modify, or approve another session's data.
12. Anonymous session records and generated artifacts expire after 24 hours.
13. The public interface and generated proposal display the synthetic-data, independent-project, and competition disclaimers.
14. Automated tests and repository checks pass on the default branch.
15. A new developer can run the project by following the public README without private organizational resources.
16. A visitor can start a custom fictional scenario, edit extracted requirements, and receive a grounded compatible, `technical_review_required`, or `out_of_scope` result without preset-specific logic.
17. Negative security tests verify prompt/tool boundary enforcement, schema validation, SQL parameterization, output encoding, CSRF and same-origin enforcement, session isolation, outbound-request allowlisting, artifact authorization, and request limits.
18. The deployed application passes a documented security review with no unresolved critical or high-severity finding in the MVP threat model.
19. The AI replies in the visitor's reliably identified language while preserving immutable catalog facts and evidence fields.
20. The multilingual evaluation suite covers the nine primary evaluation languages defined in Section 11.3, including normal discovery, clarification, refusal, and provider-fallback cases.
21. The root route is recognizable as the fictional Tankroy customer website and provides clear paths to the catalog and TankFit AI.
22. A public product page can launch the same advisor session as the full-page `/advisor` route without duplicating agent or deterministic logic.
23. Public pages contain no approval, audit, order-mutation, staff-role, provider, database, or cross-session controls.
24. The `/demo/sales` workspace remains explicitly labeled as a synthetic Sales Team Experience and exposes approval actions only after scoped `Demo Staff Mode` entry.
25. Desktop and mobile public experiences pass keyboard-accessibility and responsive smoke tests.
26. The public and workspace surfaces share one deployment and one authoritative catalog and deterministic domain pipeline.
27. `/demo` offers separate Customer Experience and Sales Team Experience entry points with clear fictional-role labels.
28. Sales Team Experience can continue the current session's eligible customer-created opportunity without copying or exposing another session.
29. An evaluator without an eligible opportunity can explicitly create a private prepared AirFlame opportunity that passes through normal deterministic and commercial validation.
30. Direct navigation or a client-controlled mode value cannot grant staff authorization or expose approval controls.

## 17. Constraints and Dependencies

- The application must be deployable as a public web application on Vercel.
- The frontend will use TypeScript, React, and the Next.js App Router.
- The backend will use the server-side capabilities of the same Next.js application, running in the Vercel Node.js runtime.
- Server Components will perform server-rendered reads, Server Actions will handle mutations initiated by the interface, and Route Handlers will be reserved for streaming chat, third-party integrations, simulated callbacks, and downloadable artifacts.
- Server-side modules will implement the compatibility engine, ROI calculator, order state machine, approval rules, provider router, audit logging, and PDF generation.
- Relational application data will use Neon serverless Postgres with the Neon serverless driver and Drizzle ORM for typed queries and migrations.
- Database credentials and AI-provider keys will remain server-side in Vercel environment variables.
- The AI-provider adapter will call Gemini, Cerebras, Groq, and OpenRouter from the backend only; the browser will communicate exclusively with TankFit AI's own endpoints.
- Fictional descriptive product metadata and compatibility attributes will have a versioned JSON fallback committed to the repository. Product images will be optimized static assets under the Next.js `public` directory for the MVP.
- The JSON fallback may support catalog browsing, compatibility filtering, and recommendations when the database is unavailable, but it must not confirm transactional price, stock, availability, or delivery lead time. Draft-order submission and checkout must pause until those fields can be revalidated against the application database.
- Generated proposal files may be created on demand and stored temporarily in a Vercel-compatible object store; their database metadata and storage objects must share the 24-hour expiration policy.
- Persistent distributed rate limiting may use a Vercel-compatible Redis service if application-level and provider-level quotas are insufficient; this decision belongs in an infrastructure ADR.
- The public MVP must operate within free-tier limits.
- Free-tier quotas, provider availability, cold starts, and third-party terms may change.
- Product images will be original AI-generated assets or other assets with documented permission for public use.
- The project must remain usable using only synthetic information and the accounts owned by the project author.

### 17.1 Technology Choice Rationale

| Choice | Why it fits the MVP | When to reconsider it |
| --- | --- | --- |
| One full-stack Next.js application | The product is web-first and maintained by one developer. A single TypeScript codebase can share catalog, order, session, validation, and API types while avoiding a second deployment, duplicated contracts, cross-origin configuration, separate secrets, and independent cold starts. | Split services if team ownership, scaling, security boundaries, or deployment lifecycles become materially different. |
| Neon Postgres with Drizzle ORM | Orders, approval state, sessions, audit events, and proposal metadata are relational. Postgres provides transactions and portability, while Drizzle provides typed queries and versioned migrations that align with the TypeScript application. | Reconsider the data layer if usage patterns become primarily document-based, globally distributed, or high-volume event streaming. |
| Versioned JSON catalog and static images | The public catalog remains available if the database is unavailable or sleeping. The fallback is inexpensive, reviewable in Git, and capable of associating each fictional product with an AI-generated image through a stable asset path. | Move catalog media to managed storage or a CMS if non-developers must edit products or the asset volume becomes large. |
| Provider-independent AI adapter | A common interface enables fallback among Gemini, Cerebras, Groq, OpenRouter, and deterministic guided mode without exposing provider credentials to the browser. | Revisit routing when real traffic, quality measurements, latency, and provider costs reveal a better ordering or a need for a managed AI gateway. |
| Demo Hub with two experience modes in one Next.js app | Customer Experience gives evaluators the public Tankroy context, while Sales Team Experience demonstrates review and approval. Sharing one app and session contract avoids duplicated catalog, agent, security, and deterministic logic. | Add separately authenticated staff infrastructure or split deployments only when ownership, compliance, scaling, or lifecycle boundaries justify them. |

Any future decision to split the backend into independently deployed services must be documented in an architecture decision record (ADR) with its alternatives, trade-offs, and migration triggers.

## 18. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| AI fabricates a technical claim | Unsafe or misleading recommendation | Structured catalog, deterministic compatibility, claim validation, evidence display |
| Free AI quota is exhausted | Public chat stops working | Multi-provider routing, rate limits, caching, deterministic guided mode |
| Database cold start adds latency | Slow first interaction | Serverless driver, regional alignment, static catalog fallback, loading feedback |
| Public abuse consumes quotas | Demo becomes unavailable | Per-IP limits, global caps, input limits, bot protection |
| Visitors enter real information | Privacy exposure | Clear warning, sample personas, input minimization, redaction, short retention |
| Project is mistaken for a real company's product | Brand or ownership confusion | Fictional company and products, explicit synthetic-data and independent-project disclaimers |
| Recommendation is treated as engineering advice | Safety risk | Scope restrictions, disclaimers, human approval, technical-review escalation |
| Free-tier terms change | Unexpected downtime or cost | No automatic paid upgrades, usage caps, portable provider adapters |
| Prompt injection attempts to expand agent authority | Unauthorized tools, data exposure, or unsafe output | Least-privilege tools, deterministic authorization, structured output validation, adversarial tests |
| Injection or browser attack targets public input | Data exposure, session compromise, or code execution | Schema validation, parameterized queries, safe rendering, CSP, same-origin enforcement, prohibited dangerous sinks |
| Cross-session or forged approval request | Unauthorized order or proposal action | Opaque sessions, signed scoped tokens, server-side authorization on every action, CSRF defenses, audit trail |
| Automated abuse exhausts compute or AI quotas | Demo outage or unexpected cost | Request limits, body limits, provider caps, timeouts, circuit breakers, staged firewall rules |
| Vulnerable dependency or leaked secret enters the repository | Supply-chain compromise or account exposure | Minimal dependencies, automated updates and scanning, secret scanning, review gates, server-only secrets |
| Customer and staff experiences are confused | Visitors may see internal controls or misunderstand the synthetic demo | Separate route and navigation contracts, explicit role labels, server authorization, surface-specific E2E checks, and visible fiction notices |
| Prepared sales fixture becomes a privileged shortcut or shared record | Evaluation could bypass deterministic controls or leak state between visitors | Create the fixture only through an explicit server mutation, clone it into the current session, run normal validation, record provenance, and forbid shared mutable demo opportunities |

## 19. Release Strategy

### Phase 1: Discovery and Foundation

- Approve PRD, specifications, architecture, and initial ADRs.
- Define the fictional catalog schema and compatibility matrix.
- Create sample scenarios and evaluation fixtures.

### Phase 2: Guided Advisor

- Build the public website and structured discovery flow.
- Implement both editable presets and the custom-scenario entry path through the same domain pipeline.
- Implement deterministic compatibility and product comparison.
- Add JSON catalog fallback and product images.

### Phase 3: AI Conversation

- Add provider-independent conversational orchestration.
- Add structured extraction, grounding validation, routing, and fallbacks.
- Add prompt-injection, hallucination, tool-boundary, malicious-input, and output-encoding evaluation tests.

### Phase 4: Transaction and Approval

- Add ROI calculation, draft order, simulated checkout, approval dashboard, and proposal generation.
- Add audit timeline, security controls, and cost metrics.

**Implementation status:** Complete for the AirFlame golden path. Anonymous sessions, commercial revalidation, deterministic ROI, order state, fictional deposit authorization, signed Demo Staff Mode, approval decisions, audit events, and on-demand proposal generation are implemented.

### Phase 5: Public Release

- Deploy to Vercel.
- Complete end-to-end, accessibility, mobile, and failure-mode testing.
- Publish the repository, demo URL, screenshots, architecture diagram, and optional demo video.

**Implementation status:** Production deployment and release verification are complete. Competition publication and submission remain intentionally pending.

### Phase 6: Tankroy Public Experience

- Reframe the root and catalog routes as the fictional Tankroy customer website.
- Add a responsive, keyboard-accessible TankFit AI entry point that can be embedded on public pages and hand off to `/advisor`.
- Turn `/demo` into the experience-selection hub, use `/demo/customer` for Customer Experience, and use `/demo/sales` for the session-scoped Sales Team Experience.
- Add surface-aware navigation, disclaimers, accessibility coverage, and E2E tests proving that public pages cannot expose staff actions.
- Support both continuation of the evaluator's own customer-created opportunity and explicit creation of a private prepared AirFlame sales fixture.

**Implementation status:** Documentation and architecture approved on this branch; UI implementation and release verification are pending.

## 20. Preset Demo Scenarios and Rationale

These presets are optional, editable starting points and repeatable evaluation fixtures. They are not exclusive customers, hidden scripts, or the only paths capable of completing the application. Every preset uses the same discovery and deterministic domain pipeline as a custom scenario.

### Scenario A: Rural Heating-Oil Distribution

**Customer:** AirFlame Fuels  
**Situation:** The company operates 500 residential heating-oil tanks across rural Ontario. Many tanks already have float gauges. The operations team wants to reduce run-outs, emergency deliveries, and unnecessary site visits.  
**Why it is included:** This is the strongest primary scenario because it demonstrates consultative discovery, existing-equipment compatibility, fleet scale, delivery economics, ROI calculation, and a clear business outcome that is easy for a general audience to understand.

### Scenario B: Remote Agricultural Water Storage

**Customer:** AgricuFlow Cooperative  
**Situation:** The cooperative manages water tanks at remote agricultural sites with inconsistent connectivity and no standardized measurement method. It needs level alerts and fewer manual inspections.  
**Why it is included:** This scenario proves that TankFit AI is not limited to fuels. It creates a meaningful comparison between radar and hydrostatic-pressure monitoring, tests connectivity constraints, and demonstrates how the system handles incomplete technical information.

### Scenario C: Beverage-Grade CO2 Inventory

**Customer:** Boreal Beverage Group  
**Situation:** The company operates beverage-production and hospitality locations that depend on CO2 inventory. It wants refill alerts, better consumption visibility, and a standardized monitoring package across sites.  
**Why it is included:** This scenario introduces industrial gas, a different measurement approach, multi-site configuration, and a stronger need for technical review and human approval. It broadens the portfolio without making the MVP catalog unmanageably large.

Together, these scenarios cover three materially different stored resources, customer types, measurement approaches, operational objectives, and risk profiles. Scenario A will be the default guided demo; Scenarios B and C will demonstrate breadth and edge cases. A visitor may instead create a fictional company D or omit a company name entirely, provided the application remains within the six supported categories and synthetic-data policy.

## 21. Resolved Product Decisions

- The MVP will be a website, not a Telegram or WhatsApp bot.
- The project will be public and written in English.
- The final product name is `TankFit AI`.
- The fictional business name is `Tankroy Systems Inc.`.
- The project owner is Davi Almeida.
- All business, products, people, prices, inventory, transactions, and documents will be fictional.
- The project will use exclusively synthetic information and will be presented as an independent personal project created for the Jornada de Dados competition.
- The AI will control conversation, not technical truth or irreversible actions.
- The application will remain useful when every AI provider is unavailable.
- The public demo transaction will represent a complete fictional demo-kit reservation with a simulated refundable deposit.
- One staff approval will gate the final proposal after the recommendation, order, and simulated payment authorization have been assembled.
- Anonymous demo sessions and generated artifacts will be retained for 24 hours.
- Public visitors will be able to simulate the complete application using a signed, session-scoped Demo Staff Mode.
- The three named scenarios are editable presets and test fixtures; public visitors may also start an independent custom fictional scenario governed by the same rules.
- The project will not depend on Wix or any real organization's system.
- Tankroy's public website and the sales workspace will share one Next.js deployment, one database, one catalog, one agent, and one deterministic domain pipeline.
- TankFit AI will be available as an embedded public assistant and as a full-page advisor; `/demo` will be the competition Demo Hub with separate Customer Experience and Sales Team Experience routes.
- Sales Team Experience may continue the current session's opportunity or create a private prepared AirFlame fixture, but mode selection alone never grants staff authorization.
