# ADR-0011: Reconcile Explicit Fleet and Pilot Quantities

**Status:** Accepted  
**Date:** September 10, 2026  
**Owner:** Davi Almeida

## Context

Discovery accepts ordinary language because visitors may not know the catalog's
internal vocabulary. A provider can omit a quantity or return the empty-form
default when a visitor writes a quantity as a word, such as “a five-tank pilot.”
That can leave the structured form showing one unit even though the visitor
explicitly described five. The quantity affects the pilot scope, current stock
validation, commercial snapshot, proposal and payment amount, so the discrepancy
must be visible and corrected before any consequential action.

## Decision

After strict provider-output validation and before compatibility evaluation, scan
the same sanitized brief with a small deterministic quantity parser. It accepts
digits and conservative cardinal words in pilot and fleet contexts, including
the supported primary-language phrasing covered by tests. It replaces only the
`pilotQuantity` or `fleetSize` field when one unambiguous quantity is found and
the value is within the existing schema bounds. Negated and bounded phrases,
such as “we do not want a five-tank pilot” or “no more than five units,” remain
unconfirmed. It does not infer quantity from dimensions, prices, dates or
unrelated numbers.

The same reconciliation runs for provider extraction and deterministic fallback.
The guided form remains the confirmation surface, and the server revalidates the
confirmed quantity against current Postgres commerce before creating a request.
The parser has no authority to select a product, confirm compatibility, change
prices or stock, approve a proposal, or create a payment.

## Alternatives considered

### Trust provider quantities and the empty-form default

This keeps the implementation small but silently changes an explicit customer
scope when a model omits or misreads a written number.

### Replace every extracted field with keyword parsing

This could improve recall for some phrases but would discard useful multilingual
provider extraction and make a second parser responsible for the entire domain.

### Require digits in the visitor's message

This excludes ordinary language and still leaves provider output unchecked when
the visitor uses digits in a more complex sentence.

## Consequences

- “Five-tank pilot,” “pilot of five units,” and equivalent tested phrasing reaches
  the form as five while remaining subject to explicit confirmation.
- Ambiguous or unrecognized quantities remain at the existing unknown/default
  behavior and cannot create a consequential request without review.
- Negated and upper-bound quantities are treated as ambiguous rather than exact
  scope.
- Provider-independent fallback behavior is consistent for the quantity fields.
- The parser is intentionally bounded; additional language or number forms need
  tests before they are added.
