## Summary
The game is now a match against a computer opponent and replaces the solo game. The player and the computer take turns clearing one chain each, under the DOTS-102 rules. The computer always plays a longest valid chain, picked by a fixed search order so its move is predictable and testable. Its chain is drawn dot by dot over about 1 second before it is cleared. Each side has its own score. When no valid move is left after a refill, a result view shows both scores, "You win", "Computer wins" or "Draw", and Play again.

## Acceptance criteria trace
Tests are the ones inside `describe('DOTS-103', …)` in `src/app/features/game/board.model.spec.ts` (BM) and `src/app/features/game/game.component.spec.ts` (GC), plus one in `src/app/app.component.spec.ts` (App).

| AC | Tests | Code | Result |
| --- | --- | --- | --- |
| AC-1 | `AC_1_new_game_shows_both_scores_at_0_and_the_players_turn` (GC), `AC_1_opening_the_page_starts_a_game_against_the_computer_with_the_players_turn` (App) | game.service.ts (`newGame`, `turn`, `playerScore`, `computerScore`), game.component.html | ok |
| AC-2 | `AC_2_clearing_a_3_plus_chain_scores_for_the_player_and_after_the_refill_it_is_the_computers_turn`, `AC_2_the_player_can_clear_a_chain_by_drag_and_by_keyboard` (GC) | game.service.ts (`endChain`, `clearChain`) | ok |
| AC-3 | `AC_3_ending_a_1_or_2_dot_chain_keeps_the_players_turn` (GC) | game.service.ts (`endChain`) | ok |
| AC-4 | `AC_4_turns_alternate_and_each_turn_clears_exactly_one_chain` (GC) | game.service.ts (`clearChain`, `playComputerMove`) | ok |
| AC-5 | `AC_5_both_scores_stay_visible_and_change_only_for_the_side_that_cleared` (GC) | game.service.ts (`clearChain`, `showPointsEarned`), game.component.html, game.component.css | ok |
| AC-6 | `AC_6_the_turn_indicator_shows_whose_turn_it_is` (GC) | game.component.html (turn indicator, active side), game.component.css | ok |
| AC-7 | `AC_7_clicks_taps_drags_and_enter_are_ignored_during_the_computers_turn`, `AC_7_arrow_keys_still_move_the_focus_cursor_during_the_computers_turn` (GC) | game.service.ts (`acceptsInput`, `acceptsArrowKeys`), game.component.ts (`onBoardKeydown`), game.component.html/.css (`blocked`) | ok |
| AC-8 | `AC_8_on_the_known_test_board_the_computer_plays_the_5_dot_chain_for_70_points`, `AC_8_the_computer_move_is_a_valid_chain_with_the_most_dots_on_random_boards`, `AC_8_a_board_without_a_valid_move_has_no_computer_move` (BM), `AC_8_the_computer_plays_the_longest_chain_on_the_known_test_board` (GC) | board.model.ts (`findComputerMove`, `connectedGroupSizes`), game.service.ts (`playComputerMove`) | ok |
| AC-9 | `AC_9_on_a_tie_the_chain_whose_starting_dot_comes_first_in_reading_order_is_played`, `AC_9_from_one_starting_dot_the_neighbors_are_tried_in_the_fixed_order`, `AC_9_the_same_board_always_gives_the_same_computer_move` (BM) | board.model.ts (`findComputerMove`, `SEARCH_ORDER_NEIGHBORS`) | ok |
| AC-10 | `AC_10_the_computer_move_is_drawn_dot_by_dot_over_1_second_then_held_and_cleared` (GC) | game.service.ts (`playComputerMove`, `COMPUTER_PAUSE_MS`, `COMPUTER_DRAW_MS`, `COMPUTER_HOLD_MS`, `clearChain`) | ok |
| AC-11 | `AC_11_no_valid_move_after_the_players_refill_ends_the_game_and_the_computer_makes_no_move`, `AC_11_no_valid_move_after_the_computers_refill_ends_the_game` (GC) | game.service.ts (`clearChain`, `playComputerMove`) | ok |
| AC-12 | `AC_12_the_result_view_shows_both_final_scores_and_the_outcome`, `AC_12_a_real_game_ending_in_a_draw_shows_draw` (GC) | game.service.ts (`outcome`), game.component.html (result view), game.component.css | ok |
| AC-13 | `AC_13_play_again_starts_a_new_game_against_the_computer` (GC) | game.service.ts (`newGame`), game.component.html | ok |

## Review guide

### Look closely
- `src/app/features/game/board.model.ts` — the computer's move: an exhaustive search for the longest valid chain (AC-8) in the fixed AC-9 search order, which is also the tie-break. The pruning skips only searches that cannot beat the best chain so far, so the result stays the same as the plain search.
- `src/app/features/game/game.service.ts` — the turn flow: a player's clear hands the turn to the computer after the refill (AC-2, AC-4), too-short chains keep the turn (AC-3), the computer move's timing (AC-10), game over after either side's refill (AC-11), the outcome (AC-12), and input blocking with arrow keys still allowed (AC-7).
- `src/app/features/game/game.component.ts` — the arrow-key check now uses `acceptsArrowKeys()`, so the focus cursor moves during the computer's turn (AC-7).
- `src/app/features/game/board.model.spec.ts`, `src/app/features/game/game.component.spec.ts` — new DOTS-103 tests, and four DOTS-101/102 tests that now play out the computer's turn between two player moves (see *Choices to confirm*).

### Routine
- `src/app/features/game/game.component.html` — the "You" and "Computer" score cards, the turn indicator, the `blocked` board class, and the result view.
- `src/app/features/game/game.component.css` — styles for the score cards, turn indicator, not-allowed cursor and result view, as in the mock.
- `src/app/app.component.spec.ts` — one page-load test (AC-1).

### Choices to confirm
- Arrow keys also move the focus cursor during the computer's own gravity/refill animation (DOTS-101 AC-13 blocks keys during the player's animation) — the glossary's "computer's turn" runs until the computer's refill is done, and AC-7 says arrow keys work during the whole computer's turn — AC-7
- Four DOTS-101/102 tests (`AC_10_score_adds_up_over_several_clears`, `AC_13_input_is_ignored_during_the_animation_which_lasts_under_half_a_second`, `AC_9_press_on_another_dot_during_a_chain_acts_as_a_click_and_the_drag_continues_from_the_last_dot`, DOTS-102 `AC_6_releasing_a_drag_or_enter_on_the_last_dot_of_a_3_plus_chain_clears_it`) now call `finishComputerTurn()` between two player moves; no assertion was removed or weakened — after the player's refill it is the computer's turn (D-1, AC-4), so the player can only move again after it — AC-4
- The old `score` signal is renamed `playerScore`, and the `data-testid="score"` / `final-score` test ids are kept for the player's score — glossary "Player score" replaces "Score"; keeping the ids leaves the DOTS-101/102 tests unchanged — AC-5
- `findComputerMove` skips searches that cannot beat the best chain so far (a chain is never longer than its connected group). The result is identical to the plain search order of AC-9 — keeps the exhaustive search of D-2 fast on boards with large same-color groups — AC-8, AC-9
- The computer's first dot appears right after the 0.4 s pause; the other dots follow at equal steps of 1 s ÷ (dots − 1) — D-11 "dots added at equal steps over 1 s in total" — AC-10

## Spec
[specs/DOTS-103-play-against-computer/spec.md](specs/DOTS-103-play-against-computer/spec.md) · reviews: 1 spec round, 1 code round

🤖 Generated with [Claude Code](https://claude.com/claude-code)
