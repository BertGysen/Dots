<!-- ie-kit:start -->
## IE Kit

This project uses the IE Kit: every product, UI and technology decision is asked or recorded.
Flow: `/shape` → `/mock` (UI only) → `/review-spec` → `/generate` → `/verify` → `/pr-feedback`.

### Hard rules

1. The AI never makes a product, UI or technology decision silently — it asks, or records it where the reviewer sees it.
2. No technology outside `stack.md` without an ADR approved by a human.
3. No code change outside an **approved** spec. No gate override; a hotfix gets its own ticket.
4. Out-of-scope or unshaped work is never changed — the kit drafts a new ticket instead.
5. Only a human approves a step, and only a human merges.
6. Subagent reviews are capped at **3 rounds**; after that a human decides.

### Standards for all code

- At least one test per acceptance criterion, named after it: `AC_<n>_<snake_description>`
  (e.g. `AC_3_rejects_order_without_address`). AC numbers come from the spec and never change.
- Class, method and variable names use the words in the spec's Glossary.
- Comments only for the non-obvious *why*. No comments that restate the code, no change history.

### Where things are

- `specs/<ticket-id>-<slug>/` — one folder per feature: `spec.md` (source of truth), `ticket.md`,
  `mock/`, `reviews/`, `open-questions.md`, `verify.md`, `tickets/`. The branch is
  `feature/<ticket-id>-<slug>`.
- `decisions/` — project ADRs: stack deviations, standards reviews, other lasting decisions.
  Read them before proposing a technology or pattern.
- Standards skills are in `.claude/skills/` (`standards-<tech>`); load the ones in the spec's
  `technologies` before writing code. The project copies are the source of truth here.
- The `status`, `mock`, `approvals` and `review_rounds` fields of a spec are written only by the
  kit's scripts. When the gate refuses a change, stop and tell the user why.
<!-- ie-kit:end -->
