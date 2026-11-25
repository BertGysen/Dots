---
kind: spec
round: 1
blockers: 0
---
# Review: spec round 1

Scope: full
Reshape level: 0

## Blockers

None.

## Suggestions

- [suggestion] R1 AC-10: "after a short pause" and "about 1 second" depend on the mock for exact values. D-11 already records 0.4 s pause, dots added at equal steps over 1 s, and a 0.3 s hold before clearing. Consider putting these numbers in AC-10 so a test can assert them without reading the mock.
- [suggestion] R1 AC-11: "The board then stops accepting input" does not say whether the arrow keys still move the focus cursor after game over, as they do during the computer's turn (AC-7). Consider saying it outright.
- [suggestion] AC-6 / D-11: the mock adds a third turn-indicator state, "Game over". AC-6 only names the player's turn and the computer's turn. Consider adding the game-over state to AC-6 so the AC and the mock match word for word.
- [suggestion] AC-8: the inline definition of "valid chain" repeats the DOTS-102 rules. Consider pointing to the DOTS-102 glossary term instead, so the two definitions cannot drift apart.
