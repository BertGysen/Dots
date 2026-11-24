---
kind: spec
round: 1
blockers: 3
---
# Review: spec round 1

Scope: full
Reshape level: 0

## Blockers

- [blocker] R7 Open questions: the section still holds an open item, "Needs ADR: Angular unit-test runner (e.g. Jest / Vitest)". `jest-vitest` is only `planned` in stack.md, and no accepted ADR in `decisions/` covers it. Fix: get a human-accepted ADR in `decisions/` that picks the unit-test runner (or settle it another way that doesn't need a new technology), record it under *Decisions*, and empty *Open questions*.
- [blocker] R6 Out of scope: "Cancelling a whole chain at once (e.g. Escape); a chain is undone only by stepping back" moves something out of scope that the ticket doesn't exclude. No *Decisions* entry covers it. Fix: add a D-entry for this exclusion with its why and decided by.
- [blocker] R2 AC-9: a drag only covers pressing on a dot when no chain is active, or pressing on the last dot of the active chain. The AC doesn't say what happens when the player presses on any other dot while a chain is active and then drags (e.g. an adjacent same-color dot, the previous dot, or an invalid dot). D-8 says "a press anywhere else while a chain is active acts as a click", but the AC is silent. It also doesn't say whether a drag that starts that way then goes on extending the chain. Fix: state in AC-9 the result of pressing on a dot other than the last dot while a chain is active, both for press-and-release and for press-and-drag.

## Suggestions

- [suggestion] R1 AC-13: "under about 0.5 s" is a number with a unit, but "about" makes the limit fuzzy for a test. Consider a hard limit, e.g. "completes within 500 ms".
- [suggestion] R1/R2 AC-18: the focus cursor's start position is not stated (on a new game, after Play again, after a clear). Consider naming it, e.g. "starts on the top-left dot and keeps its position after a clear".
- [suggestion] R2 AC-9: consider stating explicitly that a release outside the board (or outside any dot) also ends the chain. Also say that moving the pointer off the board mid-drag leaves the chain unchanged.
- [suggestion] R2 AC-17: consider naming what happens when a second finger touches the board during a drag (e.g. ignored).
- [suggestion] R2 AC-9/AC-18: consider naming what happens when inputs are mixed, e.g. Enter/Space pressed while a mouse or touch drag is in progress.
- [suggestion] R5 AC-15/AC-16: "Play again" and "game-over view" are used as domain terms. "Play again" only shows up inside the *Deal* glossary entry. Consider adding glossary rows for both.
- [suggestion] R8 AC-2: no mock panel is labelled AC-2. AC-2 is a board property rather than something the user visibly sees or does, so it isn't counted as a blocker. Consider adding a panel note, or confirm that AC-2 is not a UI AC.
- [suggestion] AC-1/AC-12: consider stating that random colors are drawn uniformly from the palette, so tests and implementation agree.
