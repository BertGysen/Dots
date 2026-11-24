# Screen-reader announcements for game events

**Came up in:** review (source: [spec review round 1, blocker R6 on D-4](../reviews/spec-round-1.md))

<!-- Drafted by the IE Kit because the request is outside the current spec. A human files it; the kit never does. -->

## Request (in the user's words)

"A shake keeps the board uncluttered; accessibility announcements for game events deserve their own ticket."

## Suggested acceptance criteria

- **AC-1:** When a 2-dot chain is ended (too-short chain), screen readers announce a short message such as "Need 3+ dots" (aria-live, polite), without visible text on the board.
- **AC-2:** When a chain is cleared, screen readers announce the points earned and the new score.
- **AC-3:** When the game ends, screen readers announce "Game over" and the final score.
