# ADR-0010: Progressive, Intent-Aware Conversational Discovery

**Status:** Accepted  
**Date:** September 6, 2026  
**Owner:** Davi Almeida

## Context

The public advisor originally evaluated every visitor message as if it were a
request for a product recommendation. A simple catalog question could therefore
produce a technical-review status, internal enum values, repeated disclaimers,
and several qualification questions. This was accurate at the rules-engine
boundary but confusing for visitors who only wanted information or did not know
technical terminology.

The advisor must remain grounded in deterministic facts while feeling like a
helpful first conversation with a solution specialist. It also needs to stop
qualification when a confirmed requirement, such as satellite connectivity,
is absent from the fictional catalog.

## Decision

Classify each turn into one of three non-authoritative conversation intents:
catalog overview, product question, or solution discovery. The classifier may
change presentation and question order, but it cannot change extracted facts,
compatibility, commerce, approval, or proposal eligibility.

Give the response model a sanitized, read-only view of the entire descriptive
catalog and operating profiles in addition to the deterministic compatibility
result. Do not place visitor-provided free text in the system prompt. The model
must answer the visitor's direct question first, translate internal values into
ordinary language, ask no more than one short question per turn, and avoid
showing rule versions or enum values unless explicitly requested.

Track a small allowlist of conversational constraints that the requirements
schema cannot represent, beginning with satellite connectivity. When one is
present, the advisor must clearly state that the catalog does not support it and
may ask only whether a supported alternative is acceptable. This context does
not create a compatible product or alter the normalized requirements.

The deterministic provider fallback follows the same intent-aware presentation
rules so a provider outage does not return internal implementation language.

## Alternatives Considered

### Let the language model infer all conversation intent

This is flexible across languages but makes a basic catalog question dependent
on provider behavior and weakens repeatable tests.

### Add every unsupported technology to the compatibility schema

This could make some exclusions explicit, but it turns an open-ended discovery
vocabulary into a growing domain enum. Unsupported conversational constraints
remain separate until the product rules need to make a durable decision about
them.

### Keep one generic technical-review response

This exposes implementation details and creates unnecessary friction for
visitors who have not asked for qualification.

## Consequences

- Catalog questions receive catalog answers instead of premature qualification.
- Discovery is progressive and asks at most one material question per turn.
- Unsupported satellite connectivity is explained immediately and honestly.
- Product facts remain grounded in versioned local data; prices and inventory
  remain excluded from conversational evidence.
- Intent classification affects wording only and cannot override deterministic
  business rules.
- Multilingual phrasing still depends on the provider on a best-effort basis;
  the deterministic fallback remains safe and concise.
