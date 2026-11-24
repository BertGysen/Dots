---
name: standards-xunit
description: Nexios coding standards for xUnit (.NET). Use when writing or reviewing xUnit (.NET) code.
last-reviewed: 2026-11-24
---

# xUnit standards

Target: xUnit v2.9+ (or v3), .NET 8+. Assertions with xUnit's `Assert`; no extra assertion
library unless an ADR adds one.
When you use this skill, say so: "Following standards-xunit."

## Naming

- Every acceptance criterion has at least one test named `AC_<n>_<snake_description>`,
  where `<n>` is the spec's AC number: `AC_3_rejects_order_without_address`.
  More tests for one AC add a suffix: `AC_3_rejects_order_without_address_when_blank`.
- Tests that cover no AC (technical edge cases) use `<Method>_<condition>_<result>` and must
  still trace to code an AC needs; `/verify` flags tests without an AC.
- Test classes: `<ClassUnderTest>Tests`; projects `<Product>.<Layer>.Tests`.

## Error handling

- Assert expected failures explicitly: `Assert.Throws<T>` for exceptions, or assert on the
  returned result / rejection reason. Never `try/catch` in a test.
- No `Assert.True(x == y)`; use `Assert.Equal(expected, actual)` so failures show values.

## Logging

- Tests do not write to the console. Use `ITestOutputHelper` only when a failure needs extra
  context.
- Code under test gets `NullLogger<T>.Instance`, or a fake logger when the AC is about logging.

## Folder structure

```
tests/<Product>.Domain.Tests/       # pure unit tests, no I/O
tests/<Product>.Application.Tests/  # use cases with fakes for infrastructure
tests/<Product>.Api.Tests/          # WebApplicationFactory, Testcontainers for SQL Server
```

- Test folders mirror `src/` feature folders.

## Tests

- Arrange / Act / Assert, separated by blank lines; one Act per test.
- `[Theory]` with `[InlineData]` for the same rule over several inputs; each row is a case the
  spec names.
- No shared mutable state between tests; use the constructor for setup, `IAsyncLifetime` for
  async setup, fixtures only for expensive resources (database container).
- Time and randomness are injected (`TimeProvider`, fake in tests), never `DateTime.Now`.
- No sleeping or retry loops in tests.
