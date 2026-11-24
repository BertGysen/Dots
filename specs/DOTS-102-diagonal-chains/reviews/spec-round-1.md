---
kind: spec
round: 1
blockers: 2
---
# Review: spec round 1

Scope: full
Reshape level: 0

## Blockers

- [blocker] R6 D-4 (Out of scope: text hint and screen-reader announcement): the *Why* only repeats the decision ("Only a short shake of the chain's dots; no text."). It does not say why there is no text hint, or why a screen-reader announcement for a too-short chain is out of scope. That second point is a non-obvious accessibility choice moved out of scope, so it needs a reason. Fix: add the real reason to D-4 (e.g. it keeps the board uncluttered, it matches the silent 1-dot cancel, or accessibility announcements are planned in a separate ticket). If a follow-up ticket exists, point to it in tickets/.
- [blocker] R6 D-5 (rule in AC-5): the *Why* only repeats the rule ("A diagonal link that would cross an existing diagonal link in the chain is ignored (extra rule)."). Forbidding crossing links is a rule the ticket did not ask for, and the entry does not say why it was added. Fix: state the reason in D-5 (e.g. crossing lines make the chain path hard to read, or it stops a chain from zig-zagging through a 2×2 square).

## Suggestions

- [suggestion] R1 AC-7: "shake briefly" leans on an unmeasurable word. The mock and D-10 pin it down (~0.3 s, horizontal, about ±5 px, static double outline with reduce motion). Consider putting the duration and the reduce-motion fallback in the AC itself so a test can check them directly.
- [suggestion] R1 AC-12: "as clearly visible as an orthogonal link" is a comparison, not a measure. D-10 already says "8 px line in the chain's color, center to center". Consider stating that in the AC (e.g. "same width and color as an orthogonal link").
- [suggestion] R5 AC-2, AC-13: "cell" is used as if it differs from "dot". The DOTS-101 glossary defines Dot as "one cell of the board", and the new "Dot circle" entry is what separates the drawn circle from the cell. Consider adding "Cell" to the glossary (the square area of the board a dot sits in) so code names have a clear term for the hit area.
- [suggestion] R6 D-1, D-2: their *Why* lines also repeat the decision. Both choices follow fairly directly from the ticket (minimum chain length 3, consistent ending), so this is not a blocker. A one-line reason (e.g. "game over must match what the player can actually clear") would still help.
- [suggestion] R6 D-8: "Answered by the developer" is not a reason. Consider "the feature changes what the player sees on the board (diagonal lines, shake)".
- [suggestion] AC-1 / D-10: D-10 records that with the keyboard a diagonal dot is reached by moving the focus cursor in two arrow presses, but no AC says so. Consider adding that to AC-1 (or a new AC) so it gets a test, and so it is clear that no diagonal key shortcut is added.
- [suggestion] AC-11: consider adding a boundary example, e.g. three same-color dots that touch only at corners in an L or a diagonal line count as a valid move, while two same-color dots alone do not.
