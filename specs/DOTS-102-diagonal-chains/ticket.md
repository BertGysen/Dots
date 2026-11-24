Ticket: DOTS-102: Allow diagonal connections and require at least 3 dots per chain

Type: User Story · Priority: Medium · Depends on: DOTS-101

As a player
I want to connect same-colored dots diagonally as well
So that I have more ways to build chains, while short chains no longer count.

Description
This ticket changes two rules from DOTS-101. Chains can now also go diagonally, and a chain needs at least 3 dots before it can be removed. Everything else stays the same: removal, scoring, dots falling down and refilling from the top.

Acceptance Criteria

A chain can grow to any of the 8 neighboring dots: horizontal, vertical or diagonal.
The same-color rule stays: every dot in the chain must match the first dot's color.
A dot still can't be added to the same chain twice.
A chain is only removed if it has at least 3 dots.
If the player clicks the last dot of a chain with fewer than 3 dots:
Nothing is removed and no points are given.
The chain is cleared, and the player gets visible feedback (for example a short shake or a "Need 3+ dots" hint).
Valid chains are removed, scored, and refilled exactly as in DOTS-101.
The line drawn between diagonal dots is shown clearly on the board.

Out of Scope
Closed loops/squares, bonus points for diagonal chains, and changes to the scoring formula.

Definition of Done

Diagonal chains and the 3-dot minimum work in a browser.
Unit tests cover:
adjacency in all 8 directions
dots that are not neighbors being rejected, including across the edge of the board
chains of 2 dots being rejected
chains of 3 or more dots being accepted
