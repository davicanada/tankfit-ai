# Engineering Process

## 1. Repository Workflow

- `main` is the protected, releasable branch.
- Work begins from an issue or documented requirement.
- Branch names use `type/short-description`, such as `feat/airflame-discovery` or `docs/catalog-adr`.
- Changes enter `main` through pull requests.
- Direct pushes to `main` are disabled after the remote repository is created.
- Each pull request links a PRD section, SPEC, ADR, or issue and includes validation evidence.

## 2. Commit Style

Use small commits with a clear outcome. Preferred prefixes:

- `feat:` user-visible capability
- `fix:` defect correction
- `docs:` documentation only
- `test:` test coverage or fixtures
- `refactor:` behavior-preserving code change
- `chore:` tooling or maintenance

Do not combine unrelated changes simply because they were made during the same session.

## 3. Required Checks

The initial CI check runs `npm run validate`, which validates catalog structure, unique identifiers, cross-references, image paths, and one-to-one commerce seed coverage.

When the application is scaffolded, the protected branch will additionally require:

- Type checking
- Linting
- Unit tests for compatibility, ROI, order state, approval, and provider routing
- Integration tests for database-scoped sessions and transaction revalidation
- End-to-end test for the AirFlame happy path and major failure paths
- Browser tests for the public Tankroy surface, Demo Hub, Customer Experience, Sales Team Experience, embedded advisor handoff, mobile behavior, and forbidden staff-control exposure
- Integration tests for prepared sales-fixture creation, provenance, idempotency, deterministic validation, and two-session isolation
- Negative tests mapped to `docs/security-threat-model.md`
- Static security-boundary validation and dependency review
- Code and secret scanning after application scaffolding
- Production build

## 4. Review Rules

Every pull request must be reviewed against:

1. Product requirement and acceptance criteria.
2. Deterministic-control boundary.
3. Synthetic-data and fictional-brand requirement.
4. Session isolation, secrets, and privacy.
5. Failure behavior and rollback.
6. Tests and documentation.
7. Threat-model impact, unsafe sinks, and authorization boundaries.
8. Public-versus-workspace route boundaries, role labels, and synthetic-data notices.

AI-generated code is treated as untrusted until Davi Almeida reviews the diff and the required checks pass.

## 5. Release Process

1. Merge a reviewed pull request into `main`.
2. Let Vercel create and verify the production deployment.
3. Run the AirFlame end-to-end smoke test.
4. Confirm deterministic mode with AI keys disabled.
5. Confirm the synthetic-data disclaimer and proposal watermark.
6. Confirm that expired or foreign sessions cannot be accessed.
7. Record known limitations in the release notes or README.
8. Confirm there is no unresolved critical or high-severity security finding.
9. Verify the public Tankroy website can launch the advisor and that both Demo Hub modes complete their documented AirFlame paths.

## 6. Security Change Review

Any change that introduces file uploads, XML, user-provided URLs, outbound destinations, shell or process execution, dynamic code, raw HTML, user-controlled paths, authentication, a general staff area, or a new data-retention category requires:

1. Threat-model revision.
2. An ADR comparing safer alternatives.
3. New negative tests.
4. Explicit review before merge.

Firewall rules begin in log mode and are promoted only after false-positive review. They do not replace application authorization, validation, or encoding.

## 7. Public Experience Revision Workflow

The public Tankroy website and the session-scoped sales workspace are one product change with a deliberate review boundary. Before implementation:

1. Update the PRD, [`specs/tankroy-public-experience.md`](specs/tankroy-public-experience.md), architecture, threat model, and ADR-0007 together.
2. Implement public navigation, the advisor entry point, and the Demo Hub without duplicating the agent, catalog, customer components, or deterministic domain modules.
3. Keep staff actions behind explicit workspace controls and server authorization; mode selection and browser visibility are never permission.
4. Create a prepared AirFlame sales fixture only through an explicit validated Server Action that creates session-private records and records provenance.
5. Add or update browser tests for public browsing, both demo modes, widget handoff, custom discovery, fixture isolation, mobile keyboard access, and the complete AirFlame path.
6. Re-run the full repository validation and record whether the production deployment has been updated. Documentation-only changes must not claim that the new surface is already live.

## 8. Branch Protection Checklist

Configure after the GitHub repository exists:

- Require a pull request before merging.
- Require the CI workflow to pass.
- Require branches to be up to date before merging.
- Block force pushes and branch deletion on `main`.
- Require conversation resolution.

For a one-person portfolio repository, an external reviewer is encouraged but not mandatory; the automated gate and explicit self-review remain mandatory.
