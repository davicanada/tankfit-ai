# ADR-0009: Reconcile Explicit Supported Materials After AI Extraction

**Status:** Accepted  
**Date:** September 5, 2026  
**Owner:** Davi Almeida

## Context

TankFit AI lets a provider extract structured facts from a visitor's fictional
brief, but provider output is untrusted. A provider can occasionally classify
an explicitly named supported material as `unsupported`, which would produce a
false `out_of_scope` result before the deterministic catalog rules run. The
catalog already contains supported water, fuel, lubricant, and industrial-gas
categories, so this failure would contradict an explicit visitor fact.

## Decision

After strict schema validation and before compatibility evaluation, compare the
provider's material field with a conservative deterministic scan of the same
brief. When exactly one supported material is explicitly named and there is no
negation or unsupported-material term, replace only an erroneous provider value
of `unsupported` with that explicit supported material. Missing, contradictory,
or ambiguous text remains `unknown`; compatibility, product selection, prices,
stock, ROI, commerce, payment, approval, and proposal eligibility remain fully
deterministic.

## Alternatives Considered

### Trust the provider's enum value

This is simpler but lets an untrusted model create false out-of-scope results.

### Let deterministic extraction replace every provider field

This improves recall for keywords but discards useful multilingual extraction
and creates a second competing discovery implementation. It also risks treating
ambiguous wording as a confirmed fact.

### Reconcile only the explicit material field

This is the smallest safe correction: material categories have a conservative
allowlist and directly gate the out-of-scope branch, while other fields retain
the provider-plus-schema behavior and remain reviewable in the guided form.

## Consequences

- Explicit supported materials cannot be rejected solely by provider drift.
- Negated, contradictory, or unsupported material wording remains conservative.
- The model still cannot determine compatibility or any commercial action.
- The rule is covered by unit tests and applies equally to every provider in the
  fallback chain.
