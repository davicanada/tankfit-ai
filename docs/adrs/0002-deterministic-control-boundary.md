# ADR-0002: Keep Consequential Decisions Outside the Language Model

**Status:** Accepted  
**Date:** August 29, 2026

## Context

The conversational model is useful for interpreting incomplete needs and explaining results, but product compatibility, price, inventory, delivery lead time, calculations, payment state, and proposal approval require repeatable and auditable behavior.

## Decision

Use a hybrid architecture. The language model controls conversation and structured requirement extraction. Deterministic application modules control compatibility, catalog claims, ROI arithmetic, commercial validation, order transitions, mock payment results, approval, and proposal eligibility.

The agent receives narrowly scoped tools and cannot write arbitrary database values or invoke approval mutations.

## Alternatives Considered

### Allow the model to recommend and transact directly

This produces a flexible prototype quickly but cannot guarantee grounded claims, compatible selections, valid state transitions, or resistance to prompt injection.

### Use only forms and deterministic rules

This is highly predictable but fails the central product objective: understanding customers who describe a problem without knowing the product vocabulary.

## Consequences

- Compatibility and transaction tests can be exhaustive and reproducible.
- AI-provider changes do not change business truth.
- Prompt injection cannot expand tool permissions.
- More explicit schemas and domain code are required.
- When rules cannot reach a safe result, the outcome is `technical_review_required`, not a plausible guess.
