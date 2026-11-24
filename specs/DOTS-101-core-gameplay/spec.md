---
ticket: DOTS-101
title: "Implement core \"Dots\" gameplay"
status: approved
has_ui: true
mock: approved
technologies: [angular]
review_rounds: {spec: 3, code: 2, pr: 1}
approvals:
  - step: shape
    by: Bert Gysen
    at: 2026-11-24T12:30:02.192Z
    note: ""
  - step: mock
    by: Bert Gysen
    at: 2026-11-24T12:37:52.974Z
    note: ""
  - step: review
    by: Bert Gysen
    at: 2026-11-24T12:43:44.276Z
    note: ""
  - step: shape
    by: Bert Gysen
    at: 2026-11-24T13:15:40.601Z
    note: ""
  - step: mock
    by: Bert Gysen
    at: 2026-11-24T13:18:37.017Z
    note: ""
  - step: review
    by: Bert Gysen
    at: 2026-11-24T13:19:57.567Z
    note: ""
---
<!-- Front matter: status draft | shaped | mocked | approved · mock none | draft | approved.
     has_ui: "" until the developer decides (true | false); locked once the spec leaves draft.
     status, mock, approvals and review_rounds are written only by the kit's scripts. -->

# Implement core "Dots" gameplay

## Original ticket
<!-- Link to ticket.md in this folder; the ticket is kept verbatim there. -->
See [ticket.md](ticket.md).

## Goal and intent
<!-- Why this feature exists and the outcome it must produce. -->
Give players the core game loop in a browser. They connect adjacent dots of the same color into
a chain, clear the chain to score points, and the board refills so play continues until no
moves are left. This is the base that later features build on (see *Out of scope*): loops,
power-ups, levels, high scores.

## Glossary
<!-- Domain words used in this spec. Code names must use these words. -->
| Term | Meaning |
| --- | --- |
| Board | The 7×7 grid of dots (7 columns, 7 rows). |
| Dot | One cell of the board; has exactly one color from the palette. |
| Palette | The fixed set of 5 dot colors. |
| Chain | The ordered list of dots the player is currently connecting. At most one chain is active at a time. |
| Starting dot | The first dot of the chain; its color is the chain's color. |
| Last dot | The most recently added dot of the chain. |
| Previous dot | The dot added just before the last dot. |
| Adjacent | Directly left, right, above or below (orthogonal); diagonals are not adjacent. |
| Step back | Removing the last dot from the chain by going back onto the previous dot. |
| End a chain | Finishing the chain: cleared if it has 2+ dots, otherwise dropped without effect. |
| Clear | Removing the chain's dots from the board and awarding points. |
| Gravity | Remaining dots in a column falling down to fill empty cells below them. |
| Refill | New random dots falling in from the top until the board is full. |
| Valid move | Two adjacent dots of the same color exist on the board. |
| Deal | Filling the whole board with new random dots (game start, Play again). |
| Score | Points the player has earned in the current game. |
| Game over | The state when the board has no valid move; play stops and the final score is shown. |
| Focus cursor | The visible keyboard marker on one dot. |

## Acceptance criteria
<!-- Numbered AC-1, AC-2 … IDs are never renumbered; a removed AC stays as "AC-n (removed)".
     After a reshape, changed ACs end with " _(changed in reshape <n>)_". -->
- **AC-1:** A new game shows a 7×7 board where each dot has a random color from a fixed palette of 5 distinct colors (a colorblind-friendly set fixed in the mock), and a score display showing 0.
- **AC-2:** A newly dealt board (game start or Play again) always contains at least one valid move; a deal without one is re-dealt until it has one.
- **AC-3:** With no chain active, clicking a dot starts a chain with that dot as starting dot.
- **AC-4:** Clicking a dot that is adjacent to the last dot and has the chain's color adds it to the chain.
- **AC-5:** Clicking a dot of a different color, a dot not adjacent to the last dot, or a dot already in the chain (other than the last dot or previous dot) is ignored; the chain stays as it is.
- **AC-6:** Clicking the previous dot steps back: the last dot is removed from the chain.
- **AC-7:** Clicking the last dot of a chain with 2 or more dots ends the chain and clears it (AC-10).
- **AC-8:** Clicking the only dot of a 1-dot chain ends the chain; nothing is removed and the score does not change.
- **AC-9:** Dragging: after a press on a dot, moving the pointer over dots applies the same rules as clicking each dot entered — valid dots are added (AC-4), the previous dot steps back (AC-6), invalid dots are ignored (AC-5). The press itself: with no chain active it starts a chain (AC-3); on the last dot of the active chain it continues that chain; on any other dot while a chain is active it acts as a click on that dot (AC-4 to AC-6), and the drag then continues from the chain's resulting last dot. Re-entering the chain's last dot during a drag (e.g. after passing over an ignored dot) does nothing; during a drag only releasing ends the chain. Releasing after the pointer entered at least one other dot ends the chain: cleared if it has 2 or more dots, otherwise nothing is removed. A press and release without entering another dot acts as a single click on the pressed dot. _(changed in reshape 1)_
- **AC-10:** Clearing a chain of n dots removes all its dots and adds n×10 + max(0, n−3)×10 points to the score (2 → 20, 3 → 30, 4 → 50, 5 → 70); the score display updates.
- **AC-11:** After a clear, the remaining dots in each column fall down to fill the empty cells below them, keeping their order (gravity).
- **AC-12:** After gravity, new dots with random palette colors fall in from the top of each column until the board is full again (refill).
- **AC-13:** Gravity and refill are animated (under about 0.5 s in total); clicks, touches and key presses on the board during the animation are ignored.
- **AC-14:** The dots of the active chain are highlighted and connected by a line in the chain's color, updated as dots are added or stepped back.
- **AC-15:** When, after a refill, the board has no valid move, the game ends: the board stops accepting input and a game-over view shows the final score and a Play again button.
- **AC-16:** Play again resets the score to 0 and deals a new board (AC-1, AC-2). Reloading the page also starts a new game; nothing is saved.
- **AC-17:** On a touchscreen, tapping a dot acts as a click and dragging a finger acts as a mouse drag (AC-9).
- **AC-18:** Arrow keys move a visible focus cursor over the dots (staying within the board); Enter or Space acts as a click on the focused dot (AC-3 to AC-8). The focus cursor starts on the top-left dot at a new game and after Play again, and stays on the same cell after a clear. It is shown only while the board has keyboard focus (Tab or an arrow key). _(changed in reshape 1)_

## Out of scope
<!-- What this feature does not do. Items raised during the flow point at a drafted ticket in tickets/. -->
- Closed loops / squares (from the ticket).
- Power-ups (from the ticket).
- Move limits (from the ticket).
- Levels (from the ticket).
- Saving high scores or any other persistence (from the ticket; see D-11).
- Any server, API or database: the game runs entirely in the browser.
- Shared editor and tooling settings (EditorConfig, Prettier, VS Code workspace files, README) → [ticket draft](tickets/1-editor-and-tooling-defaults.md)

## Technologies
<!-- Must match front matter `technologies`; each must be in the company stack or covered by an accepted ADR. -->
- `angular` — the whole game (board, chain rules, gravity/refill, score, game over) runs client-side in the browser. Unit tests run on Vitest, as named by [ADR-0002](../../decisions/0002-angular-test-runner.md).

## Decisions
<!-- One entry per decision: what, why, decided by (human | AI, approved by human), step. -->
### D-1: The palette has 5 colors
- Why: Matches the ticket's example; a fixed set of 5 distinct, colorblind-friendly colors chosen in the mock.
- Decided by: AI, approved by human
- Step: shape

### D-2: Scoring gives a bonus for long chains
- Why: 10 per dot plus an extra bonus for longer chains.
- Decided by: human
- Step: shape

### D-3: Bonus rule is +10 per dot beyond 3 (n×10 + max(0, n−3)×10)
- Why: Chain of n dots scores n×10 + max(0, n−3)×10; e.g. 2→20, 3→30, 4→50, 5→70.
- Decided by: AI, approved by human
- Step: shape

### D-4: Chains are built by click and by drag
- Why: Click-to-chain as in the ticket, plus press-and-drag across dots; releasing ends the chain.
- Decided by: human
- Step: shape

### D-5: Releasing a drag ends the chain; a press-and-release without moving acts as a click
- Why: Press on a dot and drag across dots; releasing ends the chain (scored if 2+ dots, else nothing removed). A press-and-release without moving to another dot acts as a click.
- Decided by: AI, approved by human
- Step: shape

### D-6: A too-short (1-dot) chain is ended by clicking it again, without removing anything
- Why: "too short chain cannot be removed, so the users can only click again to end the chain without removing" (user's words).
- Decided by: human
- Step: shape

### D-7: Step back is allowed
- Why: Clicking or dragging back onto the previous dot removes the last dot from the chain.
- Decided by: human
- Step: shape

### D-8: A drag continues an active chain
- Why: Dragging extends/steps back the active chain with the same rules; release ends it. A press anywhere else while a chain is active acts as a click.
- Decided by: AI, approved by human
- Step: shape

### D-9: The active chain is shown with highlighted dots and connecting lines
- Why: Dots in the chain are highlighted and connected by a line in the chain's color; exact look decided in the mock.
- Decided by: AI, approved by human
- Step: shape

### D-10: Gravity and refill are animated and input is blocked during them
- Why: Remaining dots visibly fall and new dots drop in from the top (short animation, under ~0.5 s); clicks during it are ignored.
- Decided by: AI, approved by human
- Step: shape

### D-11: With no valid move left, the game ends and the score is shown
- Why: "The game ends and your points are shown" (user's words).
- Decided by: human
- Step: shape

### D-12: Game over offers a Play again button; reload starts a new game; nothing is saved
- Why: The game-over view shows the final score and a 'Play again' button that resets score to 0 and deals a new board; reload also starts a new game (nothing saved).
- Decided by: AI, approved by human
- Step: shape

### D-13: A newly dealt board always has a valid move; refills stay purely random
- Why: A new board without any valid chain is re-dealt until it has one; refills after a chain stay purely random (they can end the game).
- Decided by: AI, approved by human
- Step: shape

### D-14: Mouse, touch and keyboard input are supported
- Why: Also play with arrow keys and Enter/Space for accessibility.
- Decided by: human
- Step: shape

### D-15: Keyboard play uses a focus cursor with Enter/Space as click
- Why: Arrow keys move a visible focus cursor over the dots; Enter/Space acts exactly as a click on the focused dot (start, add, step back, end); same rules as mouse.
- Decided by: AI, approved by human
- Step: shape

### D-16: The feature has a UI (has_ui: true)
- Why: Answered by the developer.
- Decided by: human
- Step: shape

### D-17: Technologies: angular
- Why: Angular only: board, chain rules, gravity/refill and score all client-side. .NET, SQL Server and xUnit are not needed for this ticket.
- Decided by: AI, approved by human
- Step: shape

### D-18: Screen details as drawn in the mock
- Why: Accepted per situation in the mock review ("Looks right"): a header with "Dots" and the score on the right; dark board panel; Okabe-Ito palette (blue, orange, green, pink, yellow); chain dots drawn larger with a ring in the chain's color; no feedback on an ignored click; the points just earned shown briefly next to the score (e.g. "+50"); gravity, then refill, played in sequence; a faint line from the last dot to the pointer while dragging; a white rounded-square focus cursor with a key-hint line under the board; a game-over panel over the dimmed board with the final score and Play again.
- Decided by: AI, approved by human
- Step: mock

### D-19: Unit tests run on Vitest (ADR-0002, accepted)
- Why: Review blocker R7 on Open questions, round 1. "Default runner for new Angular projects since v21 (Angular CLI builder); fast, Jest-compatible API."
- Decided by: AI, approved by human
- Step: review

### D-20: Removed "Cancelling a whole chain at once (e.g. Escape)" from Out of scope
- Why: Review blocker R6 on Out of scope, round 1. The developer chose to drop the line entirely, since the ticket never mentioned it.
- Decided by: human
- Step: review

### D-21: AC-9 states what a press on a non-last dot does during an active chain
- Why: Review blocker R2 on AC-9, round 1. "The press acts as a click (add / step back / ignored per AC-4 to AC-8); moving on with the button held then drags from the chain's current last dot with the same rules; release ends the chain."
- Decided by: AI, approved by human
- Step: review

### D-22: Re-entering the last dot during a drag does nothing; only release ends a dragged chain
- Why: Q1 from /generate. Chosen option: "Re-entering the last dot mid-drag is ignored; the chain only ends on release. Avoids accidental clears from a wobbly finger or mouse."
- Decided by: AI, approved by human
- Step: reshape 1 (source: generate)

### D-23: The focus cursor starts top-left, stays on its cell after a clear, and shows only with keyboard focus
- Why: Q2 from /generate. Chosen option: "Starts on the top-left dot at a new game and after Play again; stays on the same cell after a clear. Shown only while the board has keyboard focus (Tab or an arrow key), as in the mock's keyboard situation."
- Decided by: AI, approved by human
- Step: reshape 1 (source: generate)

### D-24: The key-hint line under the board shows only while the board has keyboard focus, like the focus cursor
- Why: Proposed in the mock's AC-18 situation; accepted as "Looks right".
- Decided by: AI, approved by human
- Step: mock

## Open questions
<!-- Must be empty before the spec can be approved. -->

## Mock
<!-- UI features only: link to mock/index.html. -->
See [mock/index.html](mock/index.html) (made by /mock).
