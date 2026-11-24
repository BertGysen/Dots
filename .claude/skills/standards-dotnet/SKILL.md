---
name: standards-dotnet
description: Nexios coding standards for .NET / C#. Use when writing or reviewing .NET / C# code.
last-reviewed: 2026-11-24
---

# .NET / C# standards

Target: .NET 8 (LTS) or later, C# 12, nullable reference types and implicit usings on.
When you use this skill, say so: "Following standards-dotnet."

## Naming

- PascalCase for types, methods, properties, constants; camelCase for locals and parameters;
  `_camelCase` for private fields. No Hungarian prefixes, no `I` on anything but interfaces.
- Use the spec's glossary words: `SandwichOrder`, not `Item`/`Data`/`Info`. No `Manager`,
  `Helper` or `Util` classes; name the thing by what it does (`OrderPricer`).
- Async methods end in `Async` and take a `CancellationToken` as last parameter.
- One public type per file; file name = type name. Namespace = folder path.
- Booleans read as questions: `IsCutOffPassed`, `HasAddress`.

## Error handling

- Expected business outcomes (validation failed, cut-off passed) are return values, not
  exceptions: return a `Result<T>` or a discriminated record (`OrderRejected(reason)`).
- Exceptions are for the unexpected. Throw the most specific built-in type
  (`ArgumentException`, `InvalidOperationException`); never throw or catch bare `Exception`
  except in the one top-level handler.
- Validate at the boundary (controller / message handler) with guard clauses;
  `ArgumentNullException.ThrowIfNull(x)` for programming errors.
- Never swallow: a `catch` either handles, adds context and rethrows (`throw;`), or logs at
  the top level. No empty catch blocks.
- APIs return RFC 9457 problem details (`Results.Problem` / `ProblemDetails`) for errors.

## Logging

- `ILogger<T>` via DI only; no `Console.WriteLine`, no static loggers.
- Structured message templates: `logger.LogInformation("Order {OrderId} placed", id)`;
  never string interpolation in log calls.
- Levels: `Information` for business events, `Warning` for handled anomalies, `Error` for
  failures needing attention. No `Debug` noise in committed code paths that run per request.
- Never log personal data (names, addresses, e-mail) or secrets; log IDs instead.

## Folder structure

```
src/<Product>.Api/            # endpoints, DI wiring, problem details
src/<Product>.Application/    # use cases, one folder per feature (Orders/PlaceOrder/…)
src/<Product>.Domain/         # entities, value objects, domain rules; no framework references
src/<Product>.Infrastructure/ # EF Core, external services
tests/<Product>.<Layer>.Tests/
```

- Feature folders inside a layer (`Orders/`), not technical folders (`Services/`, `Models/`).
- Domain does not reference Application, Infrastructure or ASP.NET Core.
- Configuration through the options pattern (`IOptions<T>`), bound and validated at startup.

## Tests

- See `standards-xunit` for test conventions. Every acceptance criterion has at least one test
  named `AC_<n>_<snake_description>`.
- Domain rules are tested without a database or web host.
