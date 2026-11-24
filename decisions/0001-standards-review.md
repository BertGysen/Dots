# ADR-0001: Standards review at project initialisation

Status: accepted
Date: 2026-11-24

## Context

This project was initialised with the IE Kit (`/init-project`, kit version 0.1.0). The company
stack (`standards/stack.md`) lists the technologies Nexios projects may use. Only those with a
`written` standards skill in the kit catalog can be selected. For this project, the user chose
.NET / C#, Angular, SQL Server and xUnit (.NET).

Each chosen catalog skill was reviewed for currency on 2026-11-24. Versions were checked
against current sources: the Microsoft .NET blog and support policy, angular.dev releases,
endoflife.date, xunit.net and the xUnit GitHub releases, and the Microsoft Lifecycle pages for
SQL Server 2022 and 2025. Points marked "model knowledge" could not be confirmed against a
current source.

## Decision

| Skill | Catalog `last-reviewed` | Findings | User decision |
|---|---|---|---|
| standards-dotnet | 2026-11-24 | Target ".NET 8 (LTS) or later, C# 12": .NET 8 and 9 reached end of support on 2026-11-10; the current LTS is .NET 10 (to Nov 2028) with C# 14. | Use as is |
| standards-angular | 2026-11-24 | Target "Angular 18 or later" includes EOL versions (18 and 19 are EOL; v20 LTS ends 2026-11-28; v22 is current). From model knowledge: the official style guide dropped file-name type suffixes in v20; zoneless and Vitest are the defaults in v21. | Use as is |
| standards-sqlserver | 2026-11-24 | No blocking findings. SQL Server 2022 is in mainstream support to 2028-01-11; SQL Server 2025 (GA 2025-11-18) is not mentioned. | Use as is |
| standards-xunit | 2026-11-24 | Allows "v2.9+ (or v3)". v3 is the active line (4.x in 2026); no stated end date for v2. | Use as is |

Technologies requested but not covered by a written skill: none.

The user kept every skill unchanged despite the findings above. Each version finding remains
open and is recorded here so a later reviewer can see it.

## Consequences

- The project copies in `.claude/skills/standards-{dotnet,angular,sqlserver,xunit}/` are this
  project's standards and the source of truth from now on.
- Any deviation from these standards, including choosing a target version other than what the
  skills state, needs a new ADR in `decisions/` that a human accepts.
- Catalog updates reach this project only through `/init-project --refresh`, which records its
  own ADR.
