## Summary

Explain the user or engineering outcome of this change.

## Related requirement or decision

Link the PRD section, SPEC, ADR, or issue that defines the change.

## Validation

- [ ] I ran `npm run validate` locally.
- [ ] I added or updated tests for changed deterministic behavior.
- [ ] I verified that no real company, customer, product, price, credential, or personal information was introduced.
- [ ] I verified that AI output cannot override catalog, compatibility, commerce, payment, or approval rules.
- [ ] I reviewed the change against `docs/security-threat-model.md` and added negative security tests where the attack surface changed.
- [ ] I did not add an upload, XML parser, arbitrary URL fetch, shell command, dynamic code execution, raw HTML rendering, or user-controlled file path without an approved ADR.
- [ ] I updated relevant documentation.

## Evidence

Include screenshots, logs, test results, or a short explanation of why visual evidence is not applicable.

## Risks and rollback

Describe the main failure mode and how this change can be reverted safely.
