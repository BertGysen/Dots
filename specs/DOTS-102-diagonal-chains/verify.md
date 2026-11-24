# Verify: DOTS-102 Allow diagonal connections and require at least 3 dots per chain

Branch: feature/DOTS-102-diagonal-chains · Base: main · Date: 2026-11-24

Tests are the ones inside `describe('DOTS-102', …)` in the two changed test files:
`src/app/features/game/board.model.spec.ts` (BM) and `src/app/features/game/game.component.spec.ts` (GC).

| AC | Tests | Code | Result |
| --- | --- | --- | --- |
| AC-1 | `AC_1_adjacency_in_all_8_directions` (BM); `AC_1_clicking_a_diagonally_adjacent_dot_of_the_chain_color_adds_it`, `AC_1_all_four_diagonal_directions_add_a_dot`, `AC_1_diagonal_dots_can_be_added_by_drag_and_by_keyboard` (GC) | src/app/features/game/board.model.ts (`isAdjacent`), src/app/features/game/game.service.ts (`extendChain`) | ok |
| AC-2 | `AC_2_non_neighbours_are_rejected_including_across_the_board_edge` (BM); `AC_2_dots_that_are_not_adjacent_are_ignored`, `AC_2_no_wrap_around_across_the_board_edge` (GC) | src/app/features/game/board.model.ts (`isAdjacent`), src/app/features/game/game.service.ts | ok |
| AC-3 | `AC_3_a_diagonal_dot_of_another_color_is_ignored` (GC) | src/app/features/game/game.service.ts (`extendChain`) | ok |
| AC-4 | `AC_4_a_dot_already_in_the_chain_is_not_added_again` (GC) | src/app/features/game/game.service.ts (`extendChain`) | ok |
| AC-5 | `AC_5_a_link_across_the_other_diagonal_of_the_same_2x2_square_is_crossing`, `AC_5_diagonal_links_in_other_squares_and_straight_links_are_not_crossing` (BM); `AC_5_a_crossing_link_is_ignored`, `AC_5_a_crossing_link_entered_during_a_drag_is_ignored` (GC) | src/app/features/game/board.model.ts (`isCrossingLink`), src/app/features/game/game.service.ts (`extendChain`) | ok |
| AC-6 | `AC_6_chain_score_is_unchanged_for_3_or_more_dots` (BM); `AC_6_ending_a_chain_of_3_dots_clears_it_and_scores_30_then_refills`, `AC_6_releasing_a_drag_or_enter_on_the_last_dot_of_a_3_plus_chain_clears_it` (GC) | src/app/features/game/board.model.ts (`MINIMUM_CHAIN_LENGTH`), src/app/features/game/game.service.ts (`endChain`) | ok |
| AC-7 | `AC_7_ending_a_2_dot_chain_by_click_removes_nothing_and_shakes_its_dots`, `AC_7_the_shake_has_a_static_fallback_for_reduced_motion_and_no_text_hint`, `AC_7_enter_on_the_last_dot_of_a_2_dot_chain_shakes_without_removing` (GC) | src/app/features/game/game.service.ts (`endChain`, `shake`, `shakingDots`), src/app/features/game/game.component.ts, src/app/features/game/game.component.html, src/app/features/game/game.component.css | ok |
| AC-8 | `AC_8_releasing_a_drag_with_2_dots_removes_nothing_and_shakes_its_dots`, `AC_8_lifting_a_finger_after_a_2_dot_drag_shakes_its_dots` (GC) | src/app/features/game/game.service.ts (`release`, `endChain`) | ok |
| AC-9 | `AC_9_ending_a_1_dot_chain_is_silent` (GC) | src/app/features/game/game.service.ts (`endChain`) | ok |
| AC-10 | `AC_10_a_new_chain_can_start_during_the_shake_and_stops_it`, `AC_10_keyboard_input_is_accepted_during_the_shake` (GC) | src/app/features/game/game.service.ts (`extendChain`, `stopShake`) | ok |
| AC-11 | `AC_11_three_same_color_dots_touching_only_diagonally_are_a_valid_move`, `AC_11_three_same_color_dots_in_a_straight_line_are_a_valid_move`, `AC_11_pairs_alone_are_not_a_valid_move`, `AC_11_deal_re_deals_until_the_board_has_three_connected_same_color_dots` (BM); `AC_11_the_game_ends_when_only_pairs_are_left_after_a_refill`, `AC_11_the_game_continues_when_three_dots_touch_only_diagonally` (GC) | src/app/features/game/board.model.ts (`hasValidMove`) | ok |
| AC-12 | `AC_12_diagonal_links_are_drawn_center_to_center_like_straight_links`, `AC_12_the_chain_line_is_drawn_under_the_dots_so_dots_stay_visible` (GC) | src/app/features/game/game.component.html (existing chain line, unchanged; draws any link center to center) | ok |
| AC-13 | `AC_13_a_diagonal_drag_through_a_cell_corner_does_not_add_that_dot`, `AC_13_the_dot_circle_has_the_drawn_dot_radius`, `AC_13_clicks_and_taps_still_target_the_whole_cell` (GC) | src/app/features/game/game.component.ts (`dotCircleAt`), src/app/features/game/game.component.html (`.cell` rect), src/app/features/game/game.component.css | ok |

## ACs without tests
- None.

## Tests without AC
- None. The tests outside `describe('DOTS-102', …)` in the same files belong to DOTS-101. The ones adapted to the new rules are listed under *Choices to confirm*.

## Changed files not linked to an AC
- None.

## Open questions
- None.

## Choices to confirm
- DOTS-101 tests that relied on replaced rules were adapted in place, keeping their DOTS-101 names (developer's choice during /generate: "Adapt to new rules"). Setups now use 3-dot chains instead of 2, so the expected scores went from 20 → 30, 50 → 60 and 50 → 80 (sum of two clears). Pair-based game-over boards became `ONE_MOVE_BOARD` (a single 3-dot group). The drag tests use pointer coordinates instead of a stubbed `elementFromPoint`. The "blue but diagonal" line was removed from DOTS-101 `AC_5_clicks_on_other_color_…` — a diagonal blue dot is now added (DOTS-102 AC-1) — AC-1, AC-6, AC-11, AC-13
- Two DOTS-101 tests asserted a replaced rule, so they were rewritten and renamed: `AC_5_diagonal_and_distant_dots_are_not_adjacent` → `AC_5_distant_dots_and_the_dot_itself_are_not_adjacent`, and `AC_7_clicking_the_last_dot_of_a_2_plus_chain_clears_it` → `AC_7_clicking_the_last_dot_of_a_3_plus_chain_clears_it` — the old names would state rules DOTS-102 replaced — AC-1, AC-6
- DOTS-102 tests sit in a nested `describe('DOTS-102', …)` block in the existing spec files, so `AC_1_…` of DOTS-102 is not mistaken for `AC_1_…` of DOTS-101 — the kit's naming has no ticket prefix and both specs number from AC-1 — all ACs
- The drag hit test is now done by geometry: the pointer's board position is rounded to the nearest cell, and the dot counts when the distance to its center is ≤ 13 px. This replaces the DOTS-101 `elementFromPoint` lookup, which hit the drawn shape, including the larger 17 px chain dot and its 22 px ring. The dot circle is therefore 13 px also for dots already in the chain (D-10: "exactly the drawn dot, radius 13 px") — AC-13
- Each dot now has a transparent 46×46 cell rectangle behind it, so a click or tap anywhere in the cell hits the dot. Before, only the drawn circle was clickable, although AC-13 says clicks "still target the whole cell" — AC-13
- The shake plays once (300 ms, ±5 px, on the dot fill) and ends by a timer that clears the shaking state. Under `prefers-reduced-motion: reduce` there is no animation; two faint offset copies of each dot (the mock's "ghosts", opacity 0.35) show for the same 300 ms — AC-7, AC-8
- A new chain started during the shake stops the shake at once (the mock shows "the shake stops at once"; AC-10 allows "may stop early") — AC-10
- The DOTS-101 Prettier warnings on the 7 game files were left as they are: they already exist on `main`, and reformatting would be a change outside the spec — none
