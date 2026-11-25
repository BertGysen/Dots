Ticket: DOTS-103: Play against the computer

Type: User Story · Priority: Medium · Depends on: DOTS-102

As a player
I want to take turns against a computer opponent
So that I have someone to compete against for the highest score.

Description
A new game mode where the player and the computer take turns removing one chain each. The player always starts. Both use the same rules as DOTS-102: horizontal, vertical and diagonal connections, at least 3 dots, then removal, dots falling down and refilling from the top. Each side has its own score. When the game ends, the side with the most points wins.

Acceptance Criteria

The player can start a game against the computer, and the player always makes the first move.
Turns alternate: the player removes one chain, then the computer removes one chain, and so on.
Each side has its own score, and both scores are always visible.
The board shows whose turn it is. The player can't click while the computer is moving.
Computer move:
The computer always plays the valid chain that scores the most points.
If several chains score the same, it picks one in a consistent way (for example, the one whose starting dot is closest to the top-left).
The chain is shown being drawn, with a short delay (about 1 second), so the player can follow the move.
Removal, scoring and refill then happen as in DOTS-101.
Game over: the game ends when either of these happens:
each side has played 10 turns (configurable), or
there is no valid chain of 3 or more dots left on the board.
Result: at the end, a screen shows both final scores and the outcome: "You win", "Computer wins" or "Draw". It also offers to start a new game.

Out of Scope
Difficulty levels, a computer that plans more than one move ahead, two human players, and online play.

Definition of Done

A full game against the computer can be played in a browser.
Unit tests cover:
turns alternating correctly
the computer choosing the highest-scoring chain, including a known test board
the tie-break rule
both game-over conditions
the win, lose and draw results
