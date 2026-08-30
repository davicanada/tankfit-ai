# ADR-0003: Separate Descriptive Fallback Data from Transactional Truth

**Status:** Accepted  
**Date:** August 29, 2026

## Context

The public catalog should remain demonstrable when a free-tier database is waking or temporarily unavailable. However, stale fallback data must not confirm a price, stock quantity, availability status, or delivery lead time during a transaction.

## Decision

Maintain two versioned datasets:

- `products.json` contains fictional descriptive fields, compatibility attributes, constraints, and image paths. It may be used as a read-only runtime fallback.
- `demo-commerce.json` contains initial fictional price, service price, stock, availability, and lead time. It is database seed data only and must never authorize a runtime transaction.

Draft-order creation and checkout require current commercial values from Postgres. If Postgres is unavailable, browsing and recommendations remain available while transaction actions pause safely.

## Alternatives Considered

### Database only, with no fallback

This provides one authoritative source but makes the entire public demonstration unavailable during a cold start or outage.

### Use one complete JSON file as the fallback for every field

This maximizes availability but can display stale commercial values as current and contradicts the requirement that transactional facts be revalidated.

### Allow the model to estimate missing commercial values

This is unacceptable because plausible text is not transactional truth.

## Consequences

- Catalog browsing remains resilient.
- Checkout fails closed when current commerce data cannot be verified.
- Seed and runtime-fallback behavior must remain explicitly separate in code.
- Automated validation must ensure every descriptive product has exactly one seed commerce record.
