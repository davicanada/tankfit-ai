# ADR-0012: Make Custom Discovery the Public Starting Point

**Status:** Accepted  
**Date:** September 10, 2026  
**Owner:** Davi Almeida

## Context

The public Tankroy website previously presented three named fictional
organizations as editable presets. Although the presets used the same
deterministic pipeline as custom input, their prominence made the experience
look scripted and suggested that the advisor was limited to those organizations.
The product value is clearer when a visitor describes an unfamiliar operation
and sees the system discover, clarify and evaluate it.

## Decision

The public experience is custom-scenario first:

- The home page presents no preloaded customer, recommendation or named
  scenario.
- The advisor and Customer Experience start with unknown technical facts and a
  neutral fictional organization name. Visitors may describe any supported
  fictional operation in natural language or edit the guided fields directly.
- The public UI does not render the named scenario presets, their logos or a
  prepared opportunity action.
- Sales Team Experience starts empty when the current session has no eligible
  opportunity and directs the evaluator to Customer Experience. An opportunity
  reaches Sales only after the visitor explicitly requests help or submits a
  validated pilot request.
- The existing named scenarios and prepared opportunity code remain internal
  regression fixtures while the test suite is migrated toward custom input.
  They do not influence compatibility, commerce, approval or payment behavior.

## Alternatives considered

### Keep the named presets prominent

This shortens a scripted demo, but it hides the discovery problem and makes the
product appear narrower than it is.

### Delete every fixture immediately

This removes recognizable names, but also discards repeatable regression data
before an equivalent fixture strategy is established. Internal fixtures are
retained temporarily and are unreachable from the public interface.

### Keep presets as an optional public control

This preserves onboarding shortcuts but continues to frame the product around
predefined customers. A future onboarding aid may be reconsidered only if it
does not prefill technical evidence or displace custom discovery.

## Consequences

- A first-time visitor experiences the same unknowns and clarifying questions
  as an unprepared customer.
- The homepage demonstrates the discovery value without asserting a solution
  for a scenario the visitor did not provide.
- E2E coverage must build at least one compatible request from neutral custom
  facts, while deterministic unit and integration fixtures remain available for
  edge cases and state-machine coverage.
- Product and engineering documents must describe custom discovery as the only
  public entry path and identify retained fixtures as test-only.
