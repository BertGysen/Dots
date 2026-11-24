---
kind: code
round: 1
blockers: 2
---
# Review: code round 1

Scope: full

## Blockers

- [blocker] Standards violation (no AC; app shell, wired under AC-1/AC-16): src/app/app.ts:10. The root component class is `App`, its file is `app.ts`, and its template and test are `app.html` and `app.spec.ts`. None of these names has a type suffix. standards-angular says: "Files kebab-case with type suffix: `order-form.component.ts`, `order.service.ts`, … Classes PascalCase with the same suffix (`OrderFormComponent`)." Fix: rename the files to `app.component.ts`, `app.component.html` and `app.component.spec.ts`, rename the class to `AppComponent`, and update the import and bootstrap call in src/main.ts:3-5.
- [blocker] Standards violation (no AC; app bootstrap): src/main.ts:6. `bootstrapApplication(...).catch((err) => console.error(err))` calls `console.error` outside a logger service. standards-angular says: "No `console.log` in committed code. Use the project's `LoggerService` (one place to switch to a remote sink); `console.error` only inside that service." Fix: send the bootstrap error through a `LoggerService` in `src/app/core/`, or record the exception where the reviewer sees it (for example an ADR or a recorded decision). Do not drop the rule silently.

## Suggestions

- [suggestion] src/app/features/game/game.component.ts:139-143: an arrow key pressed during the gravity/refill animation sets `keyboardFocus` to true, so the focus cursor and hint can appear. The cursor does not move (`moveFocusCursor` ignores the key), but AC-13 says key presses during the animation are ignored. Consider checking that input is accepted before you show the cursor.
- [suggestion] package.json:12: `"packageManager": "npm@9.2.0"`. verify.md says npm 9.2.0 crashes on this dependency tree and that npm 11 was used. Record npm 11 here so the next install does not run into the same crash.
- [suggestion] src/app/features/game/game.service.ts:127: `extendChain` also starts a chain and steps back. The glossary words Chain and Step back would fit better, for example `addToChain` or a separate `stepBack`. The Glossary rule in CLAUDE.md asks for these words.
- [suggestion] src/app/features/game/game.component.spec.ts: the tests read the DOM through `fixture.nativeElement`, while standards-angular names `fixture.debugElement`. They do test through the template, so this is not a blocker, but `debugElement` would match the standard's wording.
- [suggestion] public/favicon.ico: this is the CLI's default Angular icon. No AC needs it. Remove it, or replace it with a Dots icon in a later ticket.
