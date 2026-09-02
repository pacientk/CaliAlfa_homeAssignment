# Future work

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

| ID    | Source          | Description                                                    | Proposed track | Status |
| ----- | --------------- | -------------------------------------------------------------- | -------------- | ------ |
| FW-01 | SPEC-001, T-001 | Migrate the boundaries ESLint config to the v7 API             | small-spec     | open   |
| FW-02 | SPEC-001, T-001 | Component dimension tokens                                     | small-spec     | open   |
| FW-03 | SPEC-001, T-001 | One untokenised text style                                     | none           | open   |
| FW-04 | SPEC-001, T-006 | Residual sync race: a drain completing mid-page-fetch          | small-spec     | open   |
| FW-05 | SPEC-001, T-013 | An intermittent LogBox warning toast on launch                 | none           | open   |
| FW-06 | SPEC-001, T-013 | An automated offline end-to-end test, and the harness it needs | full triplet   | open   |
| FW-07 | Post-delivery   | A response the app cannot parse is reported as "Offline"       | small-spec     | open   |

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

## FW-05 — An intermittent LogBox warning toast on launch

Some cold starts of the Debug build raise React Native's yellow LogBox toast, "Open debugger
to view warnings." It is not reproducible on demand: it appeared on two launches during the
T-013 pass and not on four others with identical state. The warning text could not be read —
RN 0.80 moved JavaScript logs out of Metro's stdout into React Native DevTools, and the toast
dismissed rather than expanded on every tap the automation could land — so this entry records
a symptom, not a diagnosis.

**Source:** T-013 hand-off, 2026-09-02.
**Why deferred:** LogBox does not exist in a Release build, so nothing a user would ever run
is affected, and chasing an intermittent warning through DevTools costs more than the
delivery pass had left. It is recorded rather than dropped because an unread warning is a
warning nobody has ruled out.
**How to pick it up:** launch with React Native DevTools attached (`j` in an interactive
Metro), relaunch until the toast appears, and read the entry. If it is a `Require cycle` or a
key warning it is worth fixing; if it is a third-party deprecation notice it is worth an
eslint-style suppression note here instead.

## FW-06 — An automated offline end-to-end test, and the harness it needs

The offline claim is the centre of this submission and it is verified entirely by hand
(epic §18.4). Two things stand in the way of automating it, and both are worth writing down
before someone tries again.

First, there is no offline switch for an iOS **Simulator** — only for the host. Toggling the
host's Wi-Fi does make the app fail, but it does so in a way that is not a fair simulation:
the simulator process keeps an `NWPathKey=unsatisfied` route after the host interface comes
back, so every request keeps failing with `NSURLErrorNotConnectedToInternet (-1009)` until
the process is restarted. During T-013 that artefact looked exactly like an application
defect — the banner stayed on "Offline" and the queue stayed unsent for minutes — until the
system log showed the app dutifully retrying every five seconds and the OS refusing each one.
Blackholing DNS on the host instead (`networksetup -setdnsservers Wi-Fi 127.0.0.1`) leaves
the route satisfied, breaks only name resolution, and lets the running process recover the
moment DNS is restored. That is the mechanism a future harness should use, and it needs no
`sudo`.

Second, the interesting assertions are server-side: that a create and the edit queued behind
it both arrive, and that the edit is addressed to the id the create was assigned. A Maestro
flow can drive the taps but cannot make that assertion; it needs a wrapper that drives
Maestro, flips DNS, and then reads the API back with `curl`.

**Source:** T-013 hand-off, 2026-09-02.
**Why deferred:** the manual cycle passes and is documented; building the harness is a
half-day of work on the test side that buys nothing for this submission's deadline.
**Cost of leaving it:** the one claim a reviewer is most likely to probe is the one with no
regression guard behind it.

## FW-07 — A response the app cannot parse is reported as "Offline"

`malformedResponse` classifies an unreadable body as `transport`, and `reportFailure` treats
`transport` as proof the network is down. So a server that answers with something that is not
the expected JSON — an HTML error page from a proxy or a captive portal is the realistic case —
lights the red offline banner, and the five-second probe retries against it indefinitely. The
first-sync sheet does not open, because the app believes it is offline and the banner is
already speaking.

The classification itself is right: a bad body may well parse on a retry, so the request is
worth repeating. What is wrong is only the sentence the user reads, which names a cause the
app has evidence against — the server answered.

**Source:** post-delivery review of the error paths, 2026-09-02.
**Why deferred:** telling the two apart means splitting `transport` into "never reached the
server" and "reached it and could not read the answer", which changes the union that the
queue's retry policy and the connectivity service both branch on. That is a data-layer change,
not a copy change, and it is not worth making under a delivery deadline for a case that needs
a misbehaving intermediary to reach.
**Cost of leaving it:** in that scenario the app blames the user's connection for a server
problem, and offers no retry the user can drive.
