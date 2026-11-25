---
ticket: DOTS-103
title: Play against the computer
status: approved
has_ui: true
mock: approved
technologies: [angular]
review_rounds: {spec: 1, code: 0, pr: 0}
approvals:
  - step: shape
    by: Bert Gysen
    at: 2026-11-25T07:45:11.930Z
    note: ""
  - step: mock
    by: Bert Gysen
    at: 2026-11-25T07:48:37.509Z
    note: ""
  - step: review
    by: Bert Gysen
    at: 2026-11-25T07:49:57.776Z
    note: ""
---
<!-- Front matter: status draft | shaped | mocked | approved · mock none | draft | approved.
     has_ui: "" until the developer decides (true | false); locked once the spec leaves draft.
     status, mock, approvals and review_rounds are written only by the kit's scripts. -->

# Play against the computer

## Original ticket
<!-- Link to ticket.md in this folder; the ticket is kept verbatim there. -->
See [ticket.md](ticket.md).

## Goal and intent
<!-- Why this feature exists and the outcome it must produce. -->
Give the player someone to compete against. The game becomes a match against a computer
opponent: the player and the computer take turns clearing one chain each, each side collects its
own score, and the side with the most points when no valid move is left wins. The game against
the computer replaces the solo game (D-1). All board rules stay as
[DOTS-102](../DOTS-102-diagonal-chains/spec.md) and [DOTS-101](../DOTS-101-core-gameplay/spec.md)
specify: 8-direction chains of at least 3 dots, no crossing links, clear, scoring, gravity,
refill, input methods and the deal guarantee. The computer is predictable: it always plays a
longest valid chain, chosen by a fixed search order.

## Glossary
<!-- Domain words used in this spec. Code names must use these words. -->
All terms from the [DOTS-101](../DOTS-101-core-gameplay/spec.md#glossary) and
[DOTS-102](../DOTS-102-diagonal-chains/spec.md#glossary) glossaries still apply. These change or are new:

| Term | Meaning |
| --- | --- |
| Side | One of the two competitors in a game: the player or the computer. |
| Player | The human side. Always makes the first move. |
| Computer | The computer-controlled side. |
| Turn | One side's go. A turn ends when that side's chain of 3+ dots has been cleared and gravity and refill are done. |
| Player's turn | The turn in which the player builds and ends chains. |
| Computer's turn | The turn in which the computer makes its computer move. It runs from the end of the player's refill until the computer's refill is done. |
| Computer move | The chain the computer picks, drawn on the board and then cleared. |
| Player score | Points the player has earned in the current game. *(Replaces DOTS-101 "Score".)* |
| Computer score | Points the computer has earned in the current game. |
| Turn indicator | The visible display that says whose turn it is. |
| Search order | The fixed order in which the computer enumerates chains (AC-9). |
| Reading order | Row by row from top to bottom, and within a row from left to right. |
| Game over | The state when, after a refill, the board has no valid move. Play stops and the result view is shown. *(Replaces the DOTS-101 meaning.)* |
| Result view | The game-over view showing both final scores, the outcome and Play again. |
| Outcome | "You win", "Computer wins" or "Draw". |

## Acceptance criteria
<!-- Numbered AC-1, AC-2 … IDs are never renumbered; a removed AC stays as "AC-n (removed)".
     After a reshape, changed ACs end with " _(changed in reshape <n>)_". -->
- **AC-1:** Opening or reloading the page starts a new game against the computer. The board is newly dealt (DOTS-101 AC-1, AC-2), the player score and computer score are both 0, and it is the player's turn. There is no solo mode, and nothing is saved.
- **AC-2:** On the player's turn, the player builds and ends chains with the DOTS-102 rules and all DOTS-101 input methods (click, tap, drag, keyboard). Clearing a chain of 3 or more dots adds n×10 + max(0, n−3)×10 points to the player score. After gravity and refill, it becomes the computer's turn.
- **AC-3:** On the player's turn, ending a 1-dot or 2-dot chain behaves exactly as in DOTS-102 (AC-7 to AC-9: nothing removed, a shake for 2 dots). The turn stays with the player.
- **AC-4:** Turns alternate: player, computer, player, computer, and so on. After the computer's refill is done, it is the player's turn again. Each turn clears exactly one chain.
- **AC-5:** The player score and computer score are both visible at all times, including during the computer's turn and in the result view. Each side's score changes only when that side's chain is cleared. The exact look is set in the mock.
- **AC-6:** The turn indicator always shows whose turn it is: the player's turn or the computer's turn. It switches when a turn ends (AC-2, AC-4). The exact text and look are set in the mock.
- **AC-7:** During the computer's turn, clicks, taps, drags and Enter/Space on the board are ignored. Arrow keys still move the focus cursor (DOTS-101 AC-18).
- **AC-8:** The computer move is always a valid chain with the highest score on the current board, so a chain with the most dots. A valid chain follows the DOTS-102 rules: every next dot is adjacent (8 directions) and has the starting dot's color, no dot appears twice, no link is a crossing link, and it has at least 3 dots. Example: on a known test board where the longest valid chain has 5 dots, the computer plays a 5-dot chain and scores 70.
- **AC-9:** When several valid chains share the highest score, the computer plays the first one found in this search order. Starting dots are tried in reading order. From each dot, the search goes depth-first, trying the neighbors in the order up-left, up, up-right, left, right, down-left, down, down-right. A chain counts as found when its 3rd or later dot is added. A found chain replaces the best chain so far only if it has strictly more dots. The same board therefore always gives the same computer move.
- **AC-10:** The computer move is shown being drawn after a short pause. Its dots are added one by one, highlighted and linked by a line in the chain's color as for a player's chain (DOTS-101 AC-14, DOTS-102 AC-12), spread over about 1 second in total. The chain is then cleared as in DOTS-101: its dots are removed, n×10 + max(0, n−3)×10 points go to the computer score, and gravity and refill follow with their animation. The exact timing and look are set in the mock.
- **AC-11:** After any refill (the player's or the computer's), the game ends when the board has no valid move (DOTS-102 AC-11). The board then stops accepting input. When this happens after the player's refill, the computer makes no move. There is no turn limit.
- **AC-12:** At game over, the result view shows the final player score, the final computer score and the outcome. The outcome is "You win" when the player score is higher, "Computer wins" when the computer score is higher, and "Draw" when they are equal.
- **AC-13:** The result view has a Play again button. It starts a new game against the computer as in AC-1: new deal, both scores 0, player's turn.

## Out of scope
<!-- What this feature does not do. Items raised during the flow point at a drafted ticket in tickets/. -->
- Difficulty levels (from the ticket).
- A computer that plans more than one move ahead (from the ticket).
- Two human players (from the ticket).
- Online play (from the ticket).
- The solo game (one player, no computer): this feature replaces it (see D-1).
- A turn limit ("each side has played 10 turns (configurable)" in the ticket): dropped, the game ends only when no valid move is left (see D-5).
- Saving scores or any other persistence, as in DOTS-101.
- Any other change to DOTS-101/DOTS-102 board behavior (chain rules, scoring formula, gravity, refill, deal guarantee, shake, keyboard focus cursor).

## Technologies
<!-- Must match front matter `technologies`; each must be in the company stack or covered by an accepted ADR. -->
- `angular` — turns, the computer's chain search, the computer move animation, both scores and the result view all run client-side in the existing Angular game. Unit tests run on Vitest, as named by [ADR-0002](../../decisions/0002-angular-test-runner.md).

## Decisions
<!-- One entry per decision: what, why, decided by (human | AI, approved by human), step. -->
### D-1: The game against the computer replaces the solo game
- Why: "The game always starts as a vs-computer game; the solo game is no longer available."
- Decided by: human
- Step: shape

### D-2: The computer searches all valid chains exhaustively and always plays a truly longest one
- Why: "Search all valid chains under the DOTS-102 rules (8 directions, no dot twice, no crossing links, 3+ dots) and always play a truly longest one. Searches stay fast on a 7×7 board with 5 colors."
- Decided by: AI, approved by human
- Step: shape

### D-3: Tie-break: the computer plays the first highest-scoring chain found by the search
- Why: "Whichever chain the search finds first (deterministic, but defined by the algorithm, not by a rule in the spec)." The search order itself is fixed in D-4 so the tie-break can be tested.
- Decided by: human
- Step: shape

### D-4: The search order is fixed in the spec: starting dots in reading order, neighbors up-left, up, up-right, left, right, down-left, down, down-right; only a strictly longer chain replaces the best
- Why: "Starting dots are tried in reading order (row by row, top to bottom, left to right), and from each dot the neighbours in a fixed order: up-left, up, up-right, left, right, down-left, down, down-right. Only a strictly longer chain replaces the best one found so far."
- Decided by: AI, approved by human
- Step: shape

### D-5: No turn limit; the game ends only when no valid move is left
- Why: "No turn limit, the game ends when no valid moves are left" (user's words). This drops the ticket's "each side has played 10 turns (configurable)" game-over condition.
- Decided by: human
- Step: shape

### D-6: The computer's chain is drawn dot by dot over about 1 second in total
- Why: "After the player's refill finishes, a short pause, then the chain's dots are added one by one (highlight + line as for the player) spread over about 1 s; the chain then stays visible briefly before it is cleared."
- Decided by: AI, approved by human
- Step: shape

### D-7: During the computer's turn, board input is blocked except the arrow keys
- Why: "Clicks, taps, drags and Enter/Space on the board are ignored; arrow keys still move the focus cursor so a keyboard player can prepare their next move."
- Decided by: AI, approved by human
- Step: shape

### D-8: A too-short chain does not end the player's turn
- Why: "Only a cleared chain (3+ dots) ends a turn. A 1- or 2-dot chain behaves exactly as in DOTS-102 (silent drop / shake) and the player keeps their turn."
- Decided by: AI, approved by human
- Step: shape

### D-9: The feature has a UI (has_ui: true)
- Why: Answered by the developer.
- Decided by: human
- Step: shape

### D-10: Technologies: angular
- Why: Same as DOTS-101/102: the turn logic, computer search and result view run in the browser; .NET, SQL Server and xUnit are not needed.
- Decided by: AI, approved by human
- Step: shape

### D-11: Screen details as drawn in the mock
- Why: Accepted per situation in the mock review ("Looks right"): two score cards labelled "You" and "Computer" under the "Dots" title, the active side's card outlined; a full-width turn indicator under them reading "Your turn" (dark), "Computer's turn…" (purple) or "Game over" (grey, no card outlined); the turn switches only after the refill is done; "+points" shown for 1 s next to the side that scored, as in DOTS-101; computer move timing is a 0.4 s pause after the player's refill, dots added at equal steps over 1 s in total, then the full chain held 0.3 s before it is cleared; during the computer's turn the mouse cursor over the board is "not-allowed" and the arrow keys still move the focus cursor; the computer's chain looks exactly like a player's chain; the result view sits over the dimmed board with the outcome as its title, both final scores side by side and a Play again button.
- Decided by: AI, approved by human
- Step: mock

## Open questions
<!-- Must be empty before the spec can be approved. -->

## Mock
<!-- UI features only: link to mock/index.html. -->
See [mock/index.html](mock/index.html) (made by /mock).
