---
ticket: DOTS-102
title: Allow diagonal connections and require at least 3 dots per chain
status: approved
has_ui: true
mock: approved
technologies: [angular]
review_rounds: {spec: 2, code: 0, pr: 0}
approvals:
  - step: shape
    by: Bert Gysen
    at: 2026-11-24T14:25:38.790Z
    note: ""
  - step: mock
    by: Bert Gysen
    at: 2026-11-24T14:30:22.344Z
    note: ""
  - step: review
    by: Bert Gysen
    at: 2026-11-24T14:33:58.586Z
    note: ""
---
<!-- Front matter: status draft | shaped | mocked | approved · mock none | draft | approved.
     has_ui: "" until the developer decides (true | false); locked once the spec leaves draft.
     status, mock, approvals and review_rounds are written only by the kit's scripts. -->

# Allow diagonal connections and require at least 3 dots per chain

## Original ticket
<!-- Link to ticket.md in this folder; the ticket is kept verbatim there. -->
See [ticket.md](ticket.md).

## Goal and intent
<!-- Why this feature exists and the outcome it must produce. -->
Give players more ways to build chains by letting chains also go diagonally, and make short
chains stop counting: a chain must have at least 3 dots to be removed. This changes two rules of
[DOTS-101](../DOTS-101-core-gameplay/spec.md). Everything else stays as DOTS-101 specifies:
clear, scoring, gravity, refill, input methods and game over. Only the definition of a valid
move follows the new rules.

## Glossary
<!-- Domain words used in this spec. Code names must use these words. -->
All terms from the [DOTS-101 glossary](../DOTS-101-core-gameplay/spec.md#glossary) still apply. These change or are new:

| Term | Meaning |
| --- | --- |
| Adjacent | One of the up to 8 neighboring cells: directly left, right, above, below, or diagonal (one row and one column away). There is no wrap-around across the board's edge. *(Replaces the DOTS-101 meaning.)* |
| Link | The connection between two consecutive dots in the chain. A link is orthogonal or diagonal. |
| Crossing link | A diagonal link that would cross a diagonal link already in the chain: the two links are the two diagonals of the same 2×2 square of cells. |
| Minimum chain length | 3 dots. A chain is cleared only if it has at least this many dots. |
| Too-short chain | A chain with 2 dots that is ended. Nothing is removed. *(A 1-dot chain is ended silently, as in DOTS-101.)* |
| Shake | The short visual feedback on the dots of a too-short chain when it is ended. |
| Valid move | 3 dots of the same color that form a connected path of adjacent dots (8 directions). *(Replaces the DOTS-101 meaning.)* |
| End a chain | Finishing the chain. It is cleared if it has 3+ dots. With 2 dots it is a too-short chain (dropped, with a shake). With 1 dot it is dropped silently. *(Replaces the DOTS-101 meaning.)* |
| Dot circle | The drawn round dot inside its cell, as opposed to the whole cell. |

## Acceptance criteria
<!-- Numbered AC-1, AC-2 … IDs are never renumbered; a removed AC stays as "AC-n (removed)".
     After a reshape, changed ACs end with " _(changed in reshape <n>)_". -->
- **AC-1:** A dot that is adjacent to the last dot in any of the 8 directions (left, right, up, down, or one of the 4 diagonals) and has the chain's color is added to the chain. This works the same way by click, tap, drag and keyboard (Enter/Space).
- **AC-2:** A dot that is not adjacent to the last dot is ignored and the chain stays as it is. This includes dots two or more cells away and dots on the opposite edge of the board: there is no wrap-around, so (row 0, column 6) and (row 1, column 0) are not adjacent.
- **AC-3:** A dot whose color differs from the starting dot's color is ignored, also when it is diagonally adjacent; the chain stays as it is.
- **AC-4:** A dot already in the chain cannot be added a second time; it is ignored. The exceptions from DOTS-101 still apply: the previous dot steps back, and the last dot ends the chain.
- **AC-5:** A dot whose link from the last dot would be a crossing link is ignored and the chain stays as it is. Example: the chain contains the link (0,0)→(1,1); adding a link between (1,0) and (0,1) is ignored.
- **AC-6:** Ending a chain of 3 or more dots (clicking the last dot, Enter/Space on it, or releasing a drag) clears it exactly as in DOTS-101. All its dots are removed, n×10 + max(0, n−3)×10 points are added (3 → 30, 4 → 50, 5 → 70), and gravity and refill follow with their animation.
- **AC-7:** Ending a 2-dot chain by clicking or tapping its last dot, or by Enter/Space on it, removes nothing and leaves the score unchanged. The chain is cleared (no dots highlighted, no line) and its 2 dots shake briefly. There is no text hint. The exact look is set in the mock.
- **AC-8:** Releasing a drag with a 2-dot chain behaves exactly as AC-7: nothing removed, score unchanged, chain cleared, the 2 dots shake.
- **AC-9:** Ending a 1-dot chain still works as in DOTS-101 AC-8. Nothing is removed, the score does not change, and there is no shake or other feedback.
- **AC-10:** The shake is visual only. The board accepts input immediately, and starting a new chain while the shake plays is allowed (the shake may stop early).
- **AC-11:** The board has a valid move when 3 dots of the same color form a connected path of adjacent dots (8 directions). When the board has no valid move after a refill, the game ends (DOTS-101 AC-15). A newly dealt board without a valid move is re-dealt until it has one (DOTS-101 AC-2).
- **AC-12:** A diagonal link is drawn as a line from the center of one dot to the center of the other, in the chain's color. It is as clearly visible as an orthogonal link and is not hidden behind neighboring dots. The exact look is set in the mock.
- **AC-13:** During a drag, a dot counts as entered only when the pointer is inside its dot circle, not just inside its cell. A diagonal drag that passes the corners of the neighboring cells does not add those dots. Clicks and taps still target the whole cell.

## Out of scope
<!-- What this feature does not do. Items raised during the flow point at a drafted ticket in tickets/. -->
- Closed loops / squares (from the ticket).
- Bonus points for diagonal chains (from the ticket).
- Any change to the scoring formula (from the ticket).
- A text hint such as "Need 3+ dots" for a too-short chain (see D-4).
- Screen-reader announcements for game events, including a too-short chain (see D-4) → [ticket draft](tickets/1-accessibility-announcements-for-game-events.md)
- Any other change to DOTS-101 behaviour (gravity, refill, step back, keyboard focus cursor, game-over view, Play again).

## Technologies
<!-- Must match front matter `technologies`; each must be in the company stack or covered by an accepted ADR. -->
- `angular` — the changed chain rules, valid-move check, shake and line drawing all run client-side in the existing Angular game. Unit tests run on Vitest, as named by [ADR-0002](../../decisions/0002-angular-test-runner.md).

## Decisions
<!-- One entry per decision: what, why, decided by (human | AI, approved by human), step. -->
### D-1: A valid move is 3 same-color dots forming a connected path (8 directions); game over and the deal guarantee use this rule
- Why: A valid move exists when 3 same-color dots form a connected path using all 8 directions. Game over and the deal guarantee (AC-2 of DOTS-101) use this new rule.
- Decided by: AI, approved by human
- Step: shape

### D-2: Releasing a drag with a 2-dot chain behaves like clicking its last dot
- Why: Release with a 2-dot chain: nothing removed, no points, chain cleared, same visible 'too short' feedback as clicking the last dot.
- Decided by: AI, approved by human
- Step: shape

### D-3: Ending a 1-dot chain stays silent
- Why: 1-dot chain ends quietly as today — it's how a player cancels a selection. Feedback only for 2-dot chains.
- Decided by: AI, approved by human
- Step: shape

### D-4: The too-short feedback is a shake only (no text hint)
- Why: Only a short shake of the chain's dots; no text. A shake keeps the board uncluttered; screen-reader announcements for game events get their own ticket (reason added in review, see D-11).
- Decided by: human
- Step: shape

### D-5: Crossing diagonal links in one chain are forbidden
- Why: A diagonal link that would cross an existing diagonal link in the chain is ignored (extra rule). Crossing lines make the chain's path hard to read, and the rule stops a chain from zig-zagging through one 2×2 square (reason added in review, see D-12).
- Decided by: human
- Step: shape

### D-6: During a drag a dot is entered only inside its dot circle; clicks and taps keep the whole cell
- Why: During a drag, a dot counts as entered only when the pointer is inside the dot's drawn circle (not the cell's corners), so diagonal drags don't catch neighbours. Clicks/taps keep the full cell.
- Decided by: AI, approved by human
- Step: shape

### D-7: Input stays open during the shake
- Why: The shake is purely visual (~0.3 s); the chain is already cleared and the board accepts input right away. A new chain cuts the shake short.
- Decided by: AI, approved by human
- Step: shape

### D-8: The feature has a UI (has_ui: true)
- Why: Answered by the developer.
- Decided by: human
- Step: shape

### D-9: Technologies: angular
- Why: Same as DOTS-101: everything runs in the browser; .NET, SQL Server and xUnit are not needed.
- Decided by: AI, approved by human
- Step: shape

### D-10: Screen details as drawn in the mock
- Why: Accepted per situation in the mock review ("Looks right"): diagonal links look exactly like straight ones (8 px line in the chain's color, center to center); with the keyboard a diagonal dot is reached by moving the focus cursor in two arrow presses; a refused crossing link gives no feedback, like any ignored click; the shake lasts ~0.3 s, horizontal, about ±5 px, on the dots back at normal size, and with the system "reduce motion" setting the dots show a short static double outline instead of moving; the game does not highlight the remaining valid move; during a drag the area that counts is exactly the drawn dot (radius 13 px in a 46 px cell).
- Decided by: AI, approved by human
- Step: mock

### D-11: D-4 gets its reason: a shake keeps the board uncluttered; screen-reader announcements go to their own ticket
- Why: Review blocker R6 on D-4, round 1. "A shake keeps the board uncluttered; accessibility announcements for game events deserve their own ticket." Drafted as [tickets/1-accessibility-announcements-for-game-events.md](tickets/1-accessibility-announcements-for-game-events.md).
- Decided by: AI, approved by human
- Step: review

### D-12: D-5 gets its reason: a readable chain path and no zig-zagging through one 2×2 square
- Why: Review blocker R6 on D-5, round 1. Both reasons: crossing lines in an X make the chain's path hard to read on the board, and the rule stops a chain from zig-zagging through a single 2×2 square to farm length.
- Decided by: human
- Step: review

## Open questions
<!-- Must be empty before the spec can be approved. -->

## Mock
<!-- UI features only: link to mock/index.html. -->
See [mock/index.html](mock/index.html) (made by /mock).
