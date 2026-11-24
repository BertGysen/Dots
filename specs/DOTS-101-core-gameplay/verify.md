# Verify: DOTS-101 Implement core "Dots" gameplay

Branch: feature/DOTS-101-core-gameplay · Base: main · Date: 2026-11-24

Paths: `game/` = `src/app/features/game/`. Tests are in `game/board.model.spec.ts` (BM),
`game/game.component.spec.ts` (GC) and `src/app/app.component.spec.ts` (APP).

| AC | Tests | Code | Result |
| --- | --- | --- | --- |
| AC-1 | `AC_1_deal_fills_7x7_board_with_palette_colors` (BM), `AC_1_new_game_shows_7x7_board_of_palette_colors_and_score_0` (GC) | game/board.model.ts, game/game.service.ts, game/game.component.{ts,html,css}; app shell and build wiring: src/app/app.component.{ts,html}, src/app/app.routes.ts, src/app/core/logger.service.ts, src/app/app.config.ts, src/main.ts, src/index.html, src/styles.css, public/favicon.ico, angular.json, package.json, package-lock.json, tsconfig.json, tsconfig.app.json, tsconfig.spec.json, .gitignore | ok |
| AC-2 | `AC_2_deal_without_valid_move_is_re_dealt`, `AC_2_dealt_board_always_has_a_valid_move` (BM), `AC_2_new_game_board_has_a_valid_move` (GC) | game/board.model.ts (`deal`, `hasValidMove`) | ok |
| AC-3 | `AC_3_clicking_a_dot_with_no_chain_starts_a_chain` (GC) | game/game.service.ts (`selectDot`, `pressDot`, `extendChain`), game/game.component.{ts,html} | ok |
| AC-4 | `AC_4_adjacent_means_orthogonal_neighbour` (BM), `AC_4_clicking_adjacent_dot_of_chain_color_adds_it` (GC) | game/board.model.ts (`isAdjacent`), game/game.service.ts (`extendChain`) | ok |
| AC-5 | `AC_5_diagonal_and_distant_dots_are_not_adjacent` (BM), `AC_5_clicks_on_other_color_non_adjacent_or_chain_dots_are_ignored` (GC) | game/board.model.ts, game/game.service.ts (`extendChain`) | ok |
| AC-6 | `AC_6_clicking_the_previous_dot_steps_back` (GC) | game/game.service.ts (`extendChain`) | ok |
| AC-7 | `AC_7_clicking_the_last_dot_of_a_2_plus_chain_clears_it` (GC) | game/game.service.ts (`selectDot`, `endChain`) | ok |
| AC-8 | `AC_8_clicking_the_only_dot_of_a_1_dot_chain_ends_it_without_removing` (GC) | game/game.service.ts (`endChain`) | ok |
| AC-9 | `AC_9_dragging_over_valid_dots_adds_them_and_release_clears_the_chain`, `AC_9_dragging_back_onto_the_previous_dot_steps_back`, `AC_9_invalid_dots_entered_during_a_drag_are_ignored`, `AC_9_re_entering_the_last_dot_during_a_drag_does_nothing`, `AC_9_release_with_a_1_dot_chain_after_entering_other_dots_removes_nothing`, `AC_9_press_and_release_without_entering_another_dot_acts_as_a_single_click`, `AC_9_press_on_the_last_dot_continues_the_chain`, `AC_9_press_on_another_dot_during_a_chain_acts_as_a_click_and_the_drag_continues_from_the_last_dot`, `AC_9_release_outside_the_board_ends_the_chain`, `AC_9_a_faint_line_runs_from_the_last_dot_to_the_pointer_while_dragging` (GC) | game/game.service.ts (`pressDot`, `enterDot`, `release`), game/game.component.{ts,html,css} (pointer handlers, drag line) | ok |
| AC-10 | `AC_10_chain_score_is_10_per_dot_plus_10_per_dot_beyond_3`, `AC_10_clear_removes_exactly_the_chain_dots` (BM), `AC_10_clearing_4_dots_adds_50_points_and_updates_the_score_display`, `AC_10_score_adds_up_over_several_clears` (GC) | game/board.model.ts (`chainScore`, `clear`), game/game.service.ts (`endChain`, `showPointsEarned`), game/game.component.html | ok |
| AC-11 | `AC_11_gravity_drops_remaining_dots_keeping_their_order` (BM), `AC_11_after_a_clear_dots_above_fall_down_keeping_their_order` (GC) | game/board.model.ts (`applyGravity`), game/game.service.ts | ok |
| AC-12 | `AC_12_refill_fills_every_empty_cell_from_the_top_with_palette_colors` (BM), `AC_12_after_gravity_new_palette_dots_fill_the_board_from_the_top` (GC) | game/board.model.ts (`refill`, `createDot`), game/game.service.ts | ok |
| AC-13 | `AC_13_input_is_ignored_during_the_animation_which_lasts_under_half_a_second`, `AC_13_key_presses_during_the_animation_are_ignored`, `AC_13_an_arrow_key_during_the_animation_does_not_show_the_focus_cursor` (GC) | game/game.service.ts (`animating`, `acceptsInput`, `FALL_DURATION_MS`), game/game.component.{ts,css} (key handling, transitions) | ok |
| AC-14 | `AC_14_chain_dots_are_highlighted_and_joined_by_a_line_in_the_chain_color` (GC) | game/game.component.{ts,html,css} (`chainLine`, ring, enlarged dot) | ok |
| AC-15 | `AC_15_board_without_two_adjacent_same_color_dots_has_no_valid_move` (BM), `AC_15_no_valid_move_after_refill_ends_the_game_with_final_score_and_play_again`, `AC_15_game_continues_when_the_refill_leaves_a_valid_move` (GC) | game/game.service.ts (`gameOver`), game/game.component.{html,css} (game-over panel) | ok |
| AC-16 | `AC_16_play_again_resets_score_and_deals_a_new_board` (GC), `AC_16_loading_the_page_starts_a_new_game_and_saves_nothing` (APP) | game/game.service.ts (`newGame`), src/app/app.routes.ts | ok |
| AC-17 | `AC_17_tapping_acts_as_a_click_and_dragging_a_finger_acts_as_a_mouse_drag` (GC) | game/game.component.{ts,css} (pointer events incl. touch, `dotUnderPointer`, `touch-action: none`) | ok |
| AC-18 | `AC_18_focus_cursor_starts_top_left_and_shows_only_while_the_board_has_keyboard_focus`, `AC_18_focus_from_a_click_or_tap_does_not_show_the_cursor_until_an_arrow_key`, `AC_18_arrow_keys_move_the_cursor_and_it_stays_within_the_board`, `AC_18_enter_and_space_act_as_a_click_on_the_focused_dot`, `AC_18_other_keys_do_nothing`, `AC_18_focus_cursor_stays_on_the_same_cell_after_a_clear`, `AC_18_focus_cursor_starts_top_left_again_after_play_again` (GC) | game/game.service.ts (`focusCursor`, `moveFocusCursor`, `selectFocusedDot`), game/game.component.{ts,html,css} (keydown, focus/blur, cursor, hint) | ok |

## ACs without tests
- None.

## Tests without AC
- None.

## Changed files not linked to an AC
- None. The `ng new` editor and tooling defaults (`.editorconfig`, `.prettierrc`, `.vscode/*.json`, `README.md`) were reverted in d41ed82 → [ticket draft](tickets/1-editor-and-tooling-defaults.md).

## Open questions
- None.

## Choices to confirm
- Angular 21 (21.2.x, LTS) instead of the current Angular 22 — the latest CLI requires Node ≥ 22.22.3 and this machine has 22.22.1; Angular 21 runs on it, is in LTS and uses Vitest by default (ADR-0002) — all ACs
- Angular app scaffolded at the repo root (`ng new dots --directory=.`, no SSR, plain CSS, routing on) — the repo holds only this game; the CLI default layout — all ACs
- Packages installed with npm 11 (`npx npm@11 install`) — npm 9.2.0 crashes on this dependency tree ("Cannot read properties of null (reading 'edgesOut')") — all ACs
- Gravity and refill each animate for 200 ms (400 ms in total) — the spec says "under about 0.5 s in total" and the mock plays them in sequence; the split is not fixed — AC-13
- The points just earned ("+50") show next to the score for 1 s — the mock says "briefly" without a duration — AC-10
- The CLI's placeholder page and its "should render title" test were replaced by the game route (`''` lazy-loads the game) and an `AC_16_` test — the placeholder is not part of the game — AC-1, AC-16
- A `pointercancel` (the browser takes over the touch, e.g. a system gesture) is handled like a release — the spec only names release — AC-9, AC-17
- Only the primary mouse button presses a dot; right and middle buttons are ignored — the spec says "press" without naming a button — AC-9
- The board panel is focusable (`tabindex="0"`, `role="application"`, the hint line linked through `aria-describedby`); the browser's own focus outline is replaced by the focus cursor — AC-18 needs the board to take keyboard focus; the ARIA role is not fixed — AC-18
- The hint line keeps its space while hidden (`visibility: hidden`), so the page does not jump when keyboard focus comes and goes — D-24 says when it shows, not how it hides — AC-18
- The focus cursor is hidden while the game-over panel is shown — the board accepts no input then (AC-15) and the mock's game-over situation shows no cursor — AC-15, AC-18
