---
name: sit-doc
description: Generate or update the System Integration Testing (SIT) reference document at docs/SIT_DevTaskMan.md from openspec specs and the e2e/ Playwright suite. Use when the user asks to create/update/refresh the SIT document, QA test reference, or asks to sync test documentation with openspec.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git:*)
license: MIT
---

Maintain `docs/SIT_DevTaskMan.md` — the single reference document QA uses to test DevTaskMan manually, and that Playwright E2E authors use to decide what to automate next. Every test scenario in this document MUST trace back to a requirement/scenario in `openspec/specs/<capability>/spec.md`; never invent test scenarios that aren't backed by a spec.

## When invoked

1. **Read the source of truth.** Glob `openspec/specs/*/spec.md` and read every capability spec. Each `#### Scenario:` block under a `### Requirement:` is one row in the SIT document — do not skip any, do not summarize multiple scenarios into one row.
2. **Read current automation coverage.** Glob `e2e/tests/*.spec.ts` and read each file. For every openspec scenario, determine whether an existing Playwright test actually exercises it (match on the behavior described, not just the file name) — cite the exact `test(...)` name and file path if automated.
3. **Read the existing `docs/SIT_DevTaskMan.md`** if it exists. Preserve any `> QA Note:` blockquote lines under a scenario row — those are manual annotations from the QA team and must never be silently deleted, only kept or moved if the scenario itself moved.
4. **Regenerate the document** (see Structure below), diffing against the previous version: keep stable Test IDs for scenarios that still exist (match by capability + requirement + scenario name, not by position), mark removed scenarios as `~~Removed~~` in a changelog entry rather than silently deleting the row, and append new Test IDs for new scenarios at the end of their capability's table.
5. **Update the coverage summary table** at the top (per-capability automated/manual scenario counts) and the changelog entry at the bottom with today's date and a one-line summary of what changed.
6. Report a short summary to the user: total scenarios, automated count, and which capabilities have zero automated coverage.

## Structure of `docs/SIT_DevTaskMan.md`

```
# System Integration Testing — DevTaskMan

## Document Control
(version, date, source-of-truth statement pointing at openspec/specs/)

## Test Environment
- Backend: http://localhost:5000 (falls back to in-memory store if Postgres unreachable — note which store is active when a run finds a discrepancy)
- Frontend: http://localhost:5173
- Seeded accounts: table of email/role, password `password123` for all
- E2E: `cd e2e && npm test` (Playwright, Chrome channel)

## Coverage Summary
| Capability | Scenarios | Automated | Manual |
|---|---|---|---|
... one row per openspec capability ...

## Test Scenarios by Capability
### <capability-name> (openspec/specs/<capability-name>/spec.md)
| Test ID | Requirement | Scenario | Role | Given/When | Then (Expected) | Automated |
|---|---|---|---|---|---|---|
| SIT-<ABBR>-01 | ... | ... | ... | ... | ... | ✅ e2e/tests/login.spec.ts:14 — or — 🔲 Manual |

(repeat per capability, in the same order as `openspec list --specs` / alphabetical by capability id)

## Changelog
| Date | Change |
|---|---|
```

## Test ID scheme

`SIT-<CAPABILITY-ABBREVIATION>-<NN>`, two-letter-plus abbreviation per capability (e.g. `BRA` for backend-rest-api, `JWT` for jwt-user-authentication, `ELT` for e2e-login-tests). Keep a stable abbreviation map inside the document itself (in Document Control) so IDs don't drift between regenerations.

## Guardrails

- Never write a scenario row that doesn't map 1:1 to an openspec `#### Scenario:` block. If you think a gap exists that openspec doesn't cover, say so in the changelog/summary to the user — propose an openspec change for it, don't quietly add untraceable test rows.
- Never mark a scenario "Automated" without having actually read the Playwright test and confirmed it exercises that exact behavior — a file merely existing in `e2e/tests/` is not enough.
- This skill only writes `docs/SIT_DevTaskMan.md`. It does not write or modify Playwright test files, openspec specs, or application code — if the user wants new E2E tests written, that's a separate task.
