---
kind: code
round: 2
blockers: 0
---
# Review: code round 2

Scope: re-check of previous blockers

## Blockers

None.

## Re-checked

- Standards violation (app shell naming), src/app/app.ts:10: fixed. The files are now `app.component.ts`, `app.component.html` and `app.component.spec.ts`. The class is `AppComponent` and uses `templateUrl: './app.component.html'`. src/main.ts:3 imports and bootstraps `AppComponent`. No reference to the old `App` class or `./app` path is left in `src/`.
- Standards violation (`console.error` outside a logger service), src/main.ts:6: fixed. `LoggerService` was added in src/app/core/logger.service.ts, and it is now the only place that calls `console.error`. src/main.ts:7-9 sends the bootstrap error through `new LoggerService().error(...)`. The comment on line 6 says why the service is created directly: there is no injector when bootstrap fails. A grep finds no other `console.*` call in `src/`.

## Suggestions

- [suggestion] src/app/app.component.spec.ts:6: the `describe` block is still named `'App'`. Rename it to `'AppComponent'` so it matches the renamed class.
- [suggestion] src/app/features/game/game.component.ts:139: the round-1 suggestion about AC-13 was done. Arrow keys are now ignored during the animation and after game over, and the new test `AC_13_an_arrow_key_during_the_animation_does_not_show_the_focus_cursor` covers the animation case. No test checks arrow keys after game over. One could be added under AC-15 ("the board stops accepting input").
- [suggestion] package.json:12: `"packageManager": "npm@9.2.0"` is still there, although verify.md says npm 11 was needed (open since round 1).
- [suggestion] src/app/features/game/game.service.ts:74,83,93: `extendChain` still also starts a chain and steps back. A name built from the glossary words (Chain, Step back) would fit better (open since round 1).
- [suggestion] public/favicon.ico: still the CLI's default Angular icon, and no AC needs it (open since round 1).
