---
kind: spec
round: 3
blockers: 0
---
# Review: spec round 3

Scope: re-check of previous blockers (none open) + reshape re-check of AC-9, AC-18 + R3, R4, R7
Reshape level: 1

## Blockers

None.

## Re-checked

None.

## Suggestions

- [suggestion] R2 AC-9: consider saying outright what happens when the pointer leaves the board mid-drag and is released outside it, e.g. "the chain stays as it is; a release anywhere ends it". The current wording ("Releasing after the pointer entered at least one other dot ends the chain") already suggests a release anywhere counts, so this is not a blocker.
- [suggestion] R2 AC-18: consider saying what happens to keys other than arrows, Enter and Space, e.g. "other keys are ignored". Also consider saying where the focus cursor goes when the board gets keyboard focus again after mouse or touch play: back to its last cell, or to the top-left dot.
- [suggestion] R5 AC-18: "Play again" appears only inside the *Deal* glossary row and has no row of its own. "Game-over view" (AC-15) has no row either. Consider adding glossary rows for both so code names have a clear source.
- [suggestion] R4 Technologies: Vitest is allowed through ADR-0002 (accepted) and is named inside the `angular` bullet. The front matter `technologies` lists only `[angular]`. The two lists do not disagree as written. To make the dependency explicit, consider adding `jest-vitest` to the front matter and giving it its own bullet that points to ADR-0002.
- [suggestion] R1 AC-13: "under about 0.5 s" is hard to test because of "about". Consider a hard limit, e.g. "completes within 500 ms". This is outside this round's scope and is carried over.
