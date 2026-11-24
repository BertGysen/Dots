---
kind: code
round: 1
blockers: 0
---
# Review: code round 1

Scope: full

## Blockers

None.

## Suggestions

- [suggestion] src/app/features/game/board.model.spec.ts:73 and src/app/features/game/game.component.spec.ts:218: this diff renames two DOTS-101 tests to `AC_5_distant_dots_and_the_dot_itself_are_not_adjacent` and `AC_7_clicking_the_last_dot_of_a_3_plus_chain_clears_it`. They sit outside the `describe('DOTS-102', …)` block, so their AC numbers refer to DOTS-101 (adjacency and clearing). In this spec, AC-5 means a crossing link and AC-7 means a 2-dot chain. The names follow the rule as written, and verify.md lists them under *Choices to confirm*, so they are not blockers. A reader could still take them for DOTS-102 tests. If the kit allows it, confirm this naming with the human, or add a short note in the outer describe saying that those AC numbers belong to DOTS-101.
- [suggestion] src/app/features/game/game.service.ts:30: the comment `/** How long the dots of a too-short chain shake. */` mostly repeats the constant's name (CLAUDE.md: "Comments only for the non-obvious *why*"). It could be removed.
- [suggestion] src/app/features/game/game.component.ts:153-161: `dotCircleAt` uses `DOT_RADIUS` (13 px) for dots already in the chain, which are drawn at 17 px. This matches D-10 ("exactly the drawn dot, radius 13 px") and verify.md records it. If players say chain dots feel hard to drag back onto, raise it as a new ticket instead of changing it here.

Checked: every AC (AC-1 to AC-13) has at least one `AC_<n>_…` test inside `describe('DOTS-102', …)` in a test file this diff changes, and each test checks the AC's outcome. No new test lacks an AC prefix. Every changed source hunk belongs to an AC: adjacency and crossing link (AC-1, AC-2, AC-5), `MINIMUM_CHAIN_LENGTH`, shake and silent 1-dot end (AC-6 to AC-10), the 8-direction `hasValidMove` (AC-11), the dot-circle hit test and the full-cell click rect (AC-13). The `DOCUMENT` / `elementFromPoint` code was removed because the AC-13 hit test replaced it. The shake (300 ms, ±5 px, dots at r=13, reduced-motion ghosts at opacity 0.35) matches the approved mock. No standards-angular rule is broken: OnPush, signals in the feature service, `@if` control flow, no `any`, no `console.log`. The full test suite passes (83 tests in 3 files).
