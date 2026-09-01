# Future work

> **How to use this file**
>
> - Copy this template to `docs/future-work.md` the first time any spec, hotfix, or bug report defers something to it.
> - This is the register for **deferred work that is not a defect**: missing features, polish, ideas surfaced mid-execution, band-aid follow-ups. Defects go to `docs/bugs/BUG-NNN-*.md` instead — the litmus test is whether you can cite the SPEC clause the code violates.
> - It is a queue, not a graveyard. The next planning round reads this file; an item that nobody picks up for several rounds should be closed as `wont-do` with a reason rather than left to rot.
> - Delete this block when the file is filled in.

## Numbering

`FW-NN`, two-digit zero-padded, sequential across the whole project: `max(existing FW-NN) + 1`. First entry is `FW-01`. Numbers are never reused, including for `done` and `wont-do` items — a closed number stays claimed so old references keep resolving.

## Status values

| Status      | Meaning                                                 |
| ----------- | ------------------------------------------------------- |
| `open`      | in the queue, not yet scheduled                         |
| `scheduled` | a SPEC / HF has been opened for it — name it in the row |
| `done`      | shipped; the row stays as historical record             |
| `wont-do`   | deliberately dropped; the reason is mandatory           |

## Register

Most recent at the bottom. `Source` is where the item came from — a spec, hotfix, or bug — so the context is one click away.

| ID    | Source       | Description                                                   | Proposed track                            | Status |
| ----- | ------------ | ------------------------------------------------------------- | ----------------------------------------- | ------ |
| FW-01 | SPEC-NNN §21 | {one line: what is deferred and why it is worth doing later}  | small-spec / full triplet / hotfix / none | open   |
| FW-02 | HF-NNN §8    | {band-aid follow-up: what the proper fix would be}            | full triplet                              | open   |
| FW-03 | BUG-NNN      | {coverage gap that could not be closed while the bug is open} | small-spec                                | open   |

## What does NOT belong here

- **Defects** — production code contradicting a SPEC clause. File `docs/bugs/BUG-NNN-*.md`.
- **Pre-production human steps** — console settings, DNS, partner review, credential provisioning. Those go to `docs/prod-readiness.md`.
- **Open questions inside an active spec** — keep them in that spec's Open questions section until it closes.

## FW-01 — Migrate the boundaries ESLint config to the v7 API

`eslint-plugin-boundaries` prints five deprecation notices on every lint run: the config uses
legacy string element selectors, the `allow`/`disallow` shorthand without a `from`/`to`
wrapper, the legacy tuple selector, and `${...}` template syntax. The rule works and reports
correctly; the notices are plugin stdout, not lint findings.

**Source:** T-001 hand-off, 2026-09-01.
**Why deferred:** cosmetic, and rewriting a working boundary rule against a new schema under a
fixed deadline risks silently weakening the one architectural constraint the spec is judged on.
**Cost of leaving it:** every lint run carries five lines of noise, which makes "no new
warnings" harder to read at a glance.

## FW-02 — Component dimension tokens

No token group covers component dimensions: checkbox 20, task-row min-height 56, control and
floating-button height 52, OTP box 60, icon tiles 64 and 36. T-002 adds
`src/shared/ui/tokens/primitive/sizes.ts` for the ones it needs; the rest arrive as the screens
do. Worth a pass at the end to check the ladder is coherent rather than accreted.

**Source:** T-001 hand-off, 2026-09-01.

## FW-03 — One untokenised text style

The canvas draws 16/24/700 once, in the component sheet's offline-banner mock. It was not
tokenised because a single occurrence is not yet a role. If T-009 needs it, add it as a named
variant rather than composing it inline.

**Source:** T-001 hand-off, 2026-09-01.

## FW-04 — Residual sync race: a drain completing mid-page-fetch

`mergeServerTasks` protects the targets of entries still in the queue. A mutation that drains
**while** the first sync's pages are in flight is therefore absent from the snapshot the merge
was computed against, and its record is dropped from the cache until the next app start — the
write itself reached the server, so nothing is lost permanently.

The common half is closed in the binding layer, which awaits `drain()` before it starts paging.
The residual window needs a "recently confirmed" protection set inside the engine, which is a
queue change and therefore outside the binding layer's remit.

**Source:** T-006 hand-off, 2026-09-01; recorded as S-5 in the T-006 task file.
**Why deferred:** it requires a sync and a drain to overlap, the data reaches the server either
way, and the next app start restores the record. Closing it means changing the one component
the spec is judged on, after its 151 tests and 23 mutation checks were signed off.
**If time allows:** worth doing after Wave 5, with its own mutation check.
