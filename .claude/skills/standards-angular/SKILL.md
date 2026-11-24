---
name: standards-angular
description: Nexios coding standards for Angular. Use when writing or reviewing Angular code.
last-reviewed: 2026-11-24
---

# Angular standards

Target: Angular 18 or later, standalone components, TypeScript `strict: true`.
When you use this skill, say so: "Following standards-angular."

## Naming

- Files kebab-case with type suffix: `order-form.component.ts`, `order.service.ts`,
  `order-api.service.ts`, `order.model.ts`. Classes PascalCase with the same suffix
  (`OrderFormComponent`).
- Component selectors use the project prefix (`app-` unless the project sets one):
  `app-order-form`.
- Use the spec's glossary words for components, models and signals: `basket`, `cutOffTime`,
  not `items` / `deadline` when the glossary says otherwise.
- Observables end in `$`; signals do not.

## Error handling

- HTTP errors are handled once, in an `HttpInterceptorFn`: it maps the server's problem
  details to a user message and logs. Components do not `catchError` just to log.
- A component that must react to a specific failure (e.g. AC: "rejects order without
  address") catches it explicitly and shows the message the spec or mock defines.
- No `any`. Model API responses as interfaces in `*.model.ts`.
- Forms: reactive forms with typed `FormGroup`; validation messages match the mock text.

## Logging

- No `console.log` in committed code. Use the project's `LoggerService` (one place to switch
  to a remote sink); `console.error` only inside that service.
- Never log form contents or personal data.

## Folder structure

```
src/app/
  core/            # singletons: interceptors, logger, auth
  shared/          # dumb reusable components, pipes
  features/<feature>/   # one folder per feature: components, services, models, routes
  app.routes.ts    # lazy-loads feature routes
```

- Feature folders follow the spec's feature, not technical type.
- Components: `ChangeDetectionStrategy.OnPush`, inputs via `input()`, outputs via `output()`.
- State: signals in a feature service; no global store unless an ADR says so.
- Templates use the new control flow (`@if`, `@for` with `track`).

## Tests

- Unit tests next to the file (`*.spec.ts`), using the runner the project's ADR names.
- Each UI acceptance criterion has a test named after it: `it('AC_3_rejects_order_without_address', …)`.
- Test behaviour through the template (`fixture.debugElement`), not private methods.
