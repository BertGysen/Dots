# ADR-0002: Vitest as the Angular unit-test runner

Status: accepted
Date: 2026-11-24

## Context

`standards-angular` says unit tests live next to the file (`*.spec.ts`) and run on "the
runner the project's ADR names". This project had no such ADR yet. The company stack lists
`jest-vitest` (Jest / Vitest) only as `planned`, with no written standards skill, so the stack's
deviation rule requires a human-accepted ADR before it can be used.

DOTS-101 is the first feature that needs it: its Definition of Done requires unit tests for the
chain checks and the gravity/refill step. The question came up as blocker R7 in spec review
round 1 (`specs/DOTS-101-core-gameplay/reviews/spec-round-1.md`).

Options considered: Vitest, Jest (with `jest-preset-angular`), and Karma + Jasmine.

## Decision

Angular unit tests in this project run on **Vitest**, through the Angular CLI's own test
builder. Vitest has been the default runner for new Angular projects since v21, and its API is
Jest-compatible.

Chosen by the developer during spec review of DOTS-101.

## Consequences

- `*.spec.ts` tests use Vitest's `describe` / `it` / `expect`. Test names follow
  `standards-angular` (`it('AC_3_…', …)`).
- Jest and Karma + Jasmine are not used. Switching runners needs a new ADR.
- No `standards-jest-vitest` skill exists yet (state `planned`), so Vitest conventions beyond
  `standards-angular` are not standardised. When the catalog adds that skill,
  `/init-project --refresh` can bring it in.
