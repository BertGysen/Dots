---
kind: spec
round: 2
blockers: 0
---
# Review: spec round 2

Scope: re-check of previous blockers + changed: AC-9; Out of scope, Technologies, Decisions (D-19, D-20, D-21), Open questions
Reshape level: 0

## Blockers

None.

## Re-checked

- R7 Open questions: fixed. The section is empty. The unit-test runner is now settled by ADR-0002 (Vitest, status accepted) and recorded as D-19.
- R6 Out of scope: fixed. The line "Cancelling a whole chain at once (e.g. Escape)" is gone, and D-20 records why and who decided it.
- R2 AC-9: fixed. AC-9 now says what happens when the player presses on a dot that isn't the last dot while a chain is active: it acts as a click (AC-4 to AC-6), and the drag carries on from the chain's resulting last dot. It also covers a press and release without moving, and a release after entering other dots. D-21 records the choice.

## Suggestions

- [suggestion] R4 Technologies: the *Technologies* section names Vitest (inside the `angular` entry, citing ADR-0002), but the front matter `technologies` lists only `[angular]`. Vitest is allowed because ADR-0002 is accepted. To avoid any reading that the two lists disagree, consider adding `jest-vitest` to the front matter and giving it its own bullet in the section that points to ADR-0002.
- [suggestion] R2 AC-9: consider saying what happens when the pointer is released outside the board or outside any dot. Also consider saying what happens when the pointer leaves the board mid-drag (e.g. the chain stays as it is, and a release still ends it). This was carried over from round 1.
- [suggestion] R2 AC-9: consider saying whether re-entering a dot that was already ignored during the same drag is treated again as a click on that dot. For example, a dot ignored as non-adjacent might become valid after the chain moves next to it.
- [suggestion] R1 AC-13: "under about 0.5 s" is still fuzzy for a test because of "about". Consider a hard limit, e.g. "completes within 500 ms". This was carried over from round 1 and is outside this round's scope.
- [suggestion] R1/R2 AC-18: the focus cursor's start position (new game, Play again, after a clear) is still not stated. This was carried over from round 1 and is outside this round's scope.
- [suggestion] R5 AC-15/AC-16: "Play again" and "game-over view" still have no glossary rows of their own. This was carried over from round 1 and is outside this round's scope.
