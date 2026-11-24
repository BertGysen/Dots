Ticket: DOTS-101: Implement core "Dots" gameplay

Type: User Story · Priority: High

As a player
I want to connect adjacent dots of the same color
So that I clear them from the board and score points.

Description
The game board is a 7×7 grid of colored dots. The player picks a dot and draws a chain through neighboring dots of the same color. When the chain is finished, those dots are removed, points are awarded, and the board refills.

Acceptance Criteria

The board shows 7×7 dots, each with a random color from a fixed palette (e.g. 5 colors).
Clicking a dot starts a chain from it.
The chain can only grow to dots that are horizontally or vertically adjacent (no diagonals) and the same color as the starting dot.
A dot can't be added to the same chain twice.
Clicking the last dot of the chain ends it. A chain needs at least 2 dots to count.
When a chain ends:
All dots in the chain are removed.
The player gets points (e.g. 10 per dot) and the score display updates.
The remaining dots in each column fall down to fill the gaps.
New random dots fall in from the top until the board is full again.
Invalid clicks (different color, not adjacent) are ignored, and the current chain stays as it is.

Out of Scope
Closed loops/squares, power-ups, move limits, levels, and saving high scores.

Definition of Done

Gameplay works as described above in a browser.
Unit tests cover the chain checks (adjacency, color, no repeats) and the gravity/refill step.
