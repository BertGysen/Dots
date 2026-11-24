---
kind: spec
round: 2
blockers: 0
---
# Review: spec round 2

Scope: re-check of previous blockers + changed: Decisions D-4, D-5, D-11, D-12; Out of scope
Reshape level: 0

## Blockers

None.

## Re-checked

- R6 D-4: fixed. The *Why* now gives the reason: a shake keeps the board uncluttered, and screen-reader announcements for game events get their own ticket. *Decided by* is present (human).
- R6 D-5: fixed. The *Why* now gives the reason: crossing lines make the chain's path hard to read, and the rule stops a chain from zig-zagging through one 2×2 square. *Decided by* is present (human).

## Suggestions

- [suggestion] R6 D-4 / D-11: D-4 says "Decided by: human", but D-11, which records the same reason, says "AI, approved by human". Consider making them agree, or say in D-11 that the AI only wrote down the human's reason.
- [suggestion] Out of scope: the screen-reader line links to `tickets/1-accessibility-announcements-for-game-events.md`, and that file exists. Consider adding the same link to the text-hint line, or noting that the text hint is not planned for any ticket, so readers know whether it is deferred or dropped.
- [suggestion] Round 1 suggestions on parts outside this round's scope are still open and still not blockers: the AC-7 shake duration and reduce-motion fallback, the AC-12 line width, a "Cell" glossary entry, the D-1/D-2/D-8 *Why* lines, the keyboard two-press diagonal in AC-1, and an AC-11 boundary example.
