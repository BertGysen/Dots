---
name: standards-sqlserver
description: Nexios coding standards for SQL Server. Use when writing or reviewing SQL Server code.
last-reviewed: 2026-11-24
---

# SQL Server standards

Target: SQL Server 2022 / Azure SQL, accessed from .NET via EF Core migrations.
When you use this skill, say so: "Following standards-sqlserver."

## Naming

- Tables: singular PascalCase (`SandwichOrder`), in a schema per bounded context
  (`ordering.SandwichOrder`); never `dbo` for application tables.
- Columns PascalCase; primary key `Id`; foreign key `<Referenced>Id` (`CustomerId`).
- Constraints and indexes named explicitly: `PK_SandwichOrder`, `FK_SandwichOrder_Customer`,
  `IX_SandwichOrder_OrderedAt`, `UQ_Customer_Email`, `CK_SandwichOrder_Quantity`.
- Glossary words for table and column names. No abbreviations (`Qty`, `Addr`).

## Error handling

- Business rules that must hold for every write are constraints (`CHECK`, `UNIQUE`,
  `FOREIGN KEY`), not only application code.
- Procedures, if any, use `SET XACT_ABORT ON` and `THROW`; never `RAISERROR` in new code.
- Multi-statement writes run in one transaction; the application, not the database, retries
  on transient errors.

## Logging

- No logging tables written from triggers. Audit columns `CreatedAt`, `CreatedBy`,
  `ModifiedAt` (`datetime2(3)`, UTC) on tables the spec marks as auditable.
- Query diagnostics come from Query Store, not ad-hoc logging.

## Folder structure

```
src/<Product>.Infrastructure/Persistence/
  Configurations/   # one IEntityTypeConfiguration<T> per table
  Migrations/       # EF Core migrations, never edited after merge
```

- Every schema change is a migration with a descriptive name (`AddCutOffTimeToMenu`).
- Migrations are additive where possible; a destructive change (drop / rename) is called out
  in the PR review guide as risky.

## Types and queries

- `datetime2` in UTC for times, `date` for dates, `decimal(19,4)` for money,
  `nvarchar(n)` with an explicit length (no `nvarchar(max)` without a reason).
- Parameterised queries only; no string-built SQL.
- Every foreign key has an index. No `SELECT *` in committed code.

## Tests

- Repository / query tests run against a real SQL Server (Testcontainers), not the EF
  in-memory provider.
- Tests for an acceptance criterion that depends on a constraint are named after it:
  `AC_<n>_<snake_description>`.
