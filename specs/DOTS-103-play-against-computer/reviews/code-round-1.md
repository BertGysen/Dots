---
kind: code
round: 1
blockers: 0
---
# Review: code round 1

Scope: full

## Blockers

None.

## Suggestions

- [suggestion] src/app/features/game/board.model.spec.ts (`AC_9_the_same_board_always_gives_the_same_computer_move`): calling `findComputerMove` twice on the same board object only proves the function is pure. If you build the test from a fresh `deal(seeded(9))` each time, or pick a board with several tied longest chains, the test also checks the "same board, same move" claim in AC-9.
- [suggestion] src/app/features/game/game.component.spec.ts (`AC_12_the_result_view_shows_both_final_scores_and_the_outcome`): this test sets `playerScore`, `computerScore` and `gameOver` directly. Only the draw outcome is reached through real play (`AC_12_a_real_game_ending_in_a_draw_shows_draw`). The test is acceptable as is, but reaching "You win" and "Computer wins" through real play too would test the template the same way.
- [suggestion] src/app/features/game/board.model.ts:126 (`findComputerMove`): `if (best.length === groupSize) return true;` is right only because every starting dot with `groupSize <= best.length` is skipped. A short comment tying the early stop to that skip would keep a later edit from breaking the AC-9 tie-break without anyone noticing.
- [suggestion] src/app/features/game/game.component.css: the mock styles the active side with `.side.active.you` / `.side.active.computer`, and the code uses `.side.active` / `.side.computer.active`. The result looks the same. Noted only so a future mock comparison is not confused by it.
