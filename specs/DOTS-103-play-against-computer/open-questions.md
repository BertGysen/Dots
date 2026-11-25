# Open questions — DOTS-103

<!-- Written by /generate when an acceptance criterion depends on something the spec does not answer.
     One entry per question, above "Choices to confirm"; Q numbers are never reused.
     Answers become reshape decisions in spec.md. Entry format:

## Q<n>: <question>
- Blocks: AC-3, AC-5
- Why: <what the spec does not answer>
- Status: open | answered (<answer>, reshape <n>)
-->

## Choices to confirm
<!-- Picks /generate had to make that neither the spec nor a standards skill fixes (versions, layout).
     One line each: - <choice> — <why> — AC-n. The reviewer confirms or turns them into a reshape. -->
- Arrow keys also move the focus cursor during the computer's own gravity/refill animation (DOTS-101 AC-13 blocks keys during the player's animation) — the glossary's "computer's turn" runs until the computer's refill is done, and AC-7 says arrow keys work during the whole computer's turn — AC-7
- Four DOTS-101/102 tests (`AC_10_score_adds_up_over_several_clears`, `AC_13_input_is_ignored_during_the_animation_which_lasts_under_half_a_second`, `AC_9_press_on_another_dot_during_a_chain_acts_as_a_click_and_the_drag_continues_from_the_last_dot`, DOTS-102 `AC_6_releasing_a_drag_or_enter_on_the_last_dot_of_a_3_plus_chain_clears_it`) now call `finishComputerTurn()` between two player moves; no assertion was removed or weakened — after the player's refill it is the computer's turn (D-1, AC-4), so the player can only move again after it — AC-4
- The old `score` signal is renamed `playerScore`, and the `data-testid="score"` / `final-score` test ids are kept for the player's score — glossary "Player score" replaces "Score"; keeping the ids leaves the DOTS-101/102 tests unchanged — AC-5
- `findComputerMove` skips searches that cannot beat the best chain so far (a chain is never longer than its connected group). The result is identical to the plain search order of AC-9 — keeps the exhaustive search of D-2 fast on boards with large same-color groups — AC-8, AC-9
- The computer's first dot appears right after the 0.4 s pause; the other dots follow at equal steps of 1 s ÷ (dots − 1) — D-11 "dots added at equal steps over 1 s in total" — AC-10
