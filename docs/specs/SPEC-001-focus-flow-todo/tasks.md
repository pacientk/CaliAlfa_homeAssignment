# SPEC-001 — Tasks

**Parent epic:** [SPEC-001: Focus & Flow — offline-first to-do application](./epic.md)
**Status:** `in-progress`
**Created:** 2026-09-01
**Last updated:** 2026-09-01

Thirteen tasks, so each lives in its own file under `tasks/`. This file carries the index.

### Task index

| ID                                          | Title                                         | Type    | Size | Risk   | Status      | Blocked by                 | Blocks                            |
| ------------------------------------------- | --------------------------------------------- | ------- | ---- | ------ | ----------- | -------------------------- | --------------------------------- |
| [T-001](./tasks/T-001-design-tokens.md)     | Design token layer and theme                  | feature | M    | medium | not-started | —                          | T-002                             |
| [T-002](./tasks/T-002-ui-atoms.md)          | UI atom layer                                 | feature | M    | medium | not-started | T-001                      | T-003, T-008, T-009, T-011, T-012 |
| [T-003](./tasks/T-003-app-shell.md)         | FSD skeleton, navigation, providers           | infra   | M    | medium | not-started | T-002                      | T-007, T-008, T-009, T-011, T-012 |
| [T-004](./tasks/T-004-task-entity-api.md)   | Task entity and API client                    | feature | M    | medium | not-started | —                          | T-005, T-010                      |
| [T-005](./tasks/T-005-offline-queue.md)     | Offline core — storage, queue, drain          | feature | L    | high   | not-started | T-004                      | T-006                             |
| [T-006](./tasks/T-006-task-data-layer.md)   | Task data layer — hooks over the queue        | feature | M    | high   | not-started | T-005                      | T-009, T-011                      |
| [T-007](./tasks/T-007-firebase-auth.md)     | Firebase phone authentication                 | feature | M    | high   | not-started | T-003                      | T-008, T-012                      |
| [T-008](./tasks/T-008-auth-screens.md)      | Welcome, phone, verification screens          | feature | M    | medium | not-started | T-007                      | —                                 |
| [T-009](./tasks/T-009-task-list-screen.md)  | Task list screen                              | feature | L    | high   | not-started | T-006                      | T-011                             |
| [T-010](./tasks/T-010-title-validation.md)  | Title validation                              | feature | S    | medium | not-started | T-004                      | T-011                             |
| [T-011](./tasks/T-011-task-form-screens.md) | New task and detail / edit screens            | feature | L    | medium | not-started | T-006, T-009, T-010        | —                                 |
| [T-012](./tasks/T-012-calendar-settings.md) | Calendar placeholder and Settings             | feature | S    | low    | not-started | T-007                      | —                                 |
| [T-013](./tasks/T-013-delivery.md)          | Delivery — README, readiness, end-to-end pass | docs    | M    | medium | not-started | T-008, T-009, T-011, T-012 | —                                 |

Legend: `type` ∈ { feature, refactor, test, research, bugfix, infra, docs }. `size` ∈ { S, M, L }.

### Shape of the breakdown

Two independent foundations open the work: the visual stack (T-001 → T-002 → T-003) and the
data stack (T-004 → T-005 → T-006). They stay separate until the screens need both, which is
what makes the first half parallelisable. The offline queue is deliberately the earliest large
task, because it is the piece the spec is judged on and the piece whose surprises must surface
while there is still time to absorb them.
