# Open questions — DOTS-101

<!-- Written by /generate when an acceptance criterion depends on something the spec does not answer.
     One entry per question, above "Choices to confirm"; Q numbers are never reused.
     Answers become reshape decisions in spec.md. Entry format:

## Q<n>: <question>
- Blocks: AC-3, AC-5
- Why: <what the spec does not answer>
- Status: open | answered (<answer>, reshape <n>)
-->

## Q1: During a drag, what happens when the pointer re-enters the last dot (e.g. after passing over an ignored dot and coming back)?
- Blocks: AC-9, AC-17
- Why: AC-9 says each dot entered is treated like a click, but lists only add, step back and ignore as outcomes. A click on the last dot ends the chain (AC-7/AC-8), so read literally, wobbling back onto the last dot mid-drag would end the chain before release. The spec does not say whether that is intended.
- Status: answered (re-entering the last dot during a drag does nothing; only release ends the chain, reshape 1)

## Q2: Where does the focus cursor start, and when is it visible?
- Blocks: AC-18
- Why: AC-18 requires a visible focus cursor moved by arrow keys, but does not say which dot it is on at a new game, after Play again or after a clear. Nor does it say whether it shows all the time or only when the board has keyboard focus (the mock shows it only in the keyboard situation).
- Status: answered (cursor starts top-left at a new game and Play again, stays on its cell after a clear, shown only while the board has keyboard focus, reshape 1)

## Choices to confirm
<!-- Picks /generate had to make that neither the spec nor a standards skill fixes (versions, layout).
     One line each: - <choice> — <why> — AC-n. The reviewer confirms or turns them into a reshape. -->
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
