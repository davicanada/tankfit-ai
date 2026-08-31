# ADR-0006: Generate approved proposals on demand

**Status:** Accepted  
**Date:** August 30, 2026  
**Owner:** Davi Almeida

## Context

The public AirFlame demonstration needs a downloadable proposal after human approval. The document contains only synthetic information, expires with a 24-hour anonymous session, and must remain inaccessible to other sessions. Persisting generated files would introduce an additional storage service, cleanup jobs, public-link controls, and orphaned-artifact risk.

## Decision

TankFit AI stores proposal eligibility and opaque metadata in Neon Postgres but does not store the PDF file. A Node.js Route Handler verifies the signed session cookie, opaque proposal identifier, expiry, and approved order state, then generates a two-page PDF in process from current approved records.

The response uses `private, no-store` caching and a download disposition. Every page carries a synthetic competition-demo watermark and a footer stating that it is not a real offer, payment, product, or company.

## Consequences

- No object-storage account, public blob URL, or cleanup worker is required.
- A copied proposal identifier is insufficient without the matching anonymous session.
- Approved state remains recoverable if one PDF generation attempt fails.
- PDF generation consumes function time on each download, which is acceptable for this low-volume portfolio demonstration.
- A future production system may adopt private object storage if document volume, signing, immutable retention, or external delivery requirements change.
