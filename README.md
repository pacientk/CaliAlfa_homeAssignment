# Focus & Flow

An offline-first to-do application for iOS. React Native 0.80.3, TypeScript, Firebase phone
authentication, a mockapi.io backend, and a persisted mutation queue that makes every write
survive both a lost network and a process restart.

Built as a take-home assignment over a single working day.

---

## Read this first — three things that will otherwise surprise you

**1. Only a Firebase test phone number can sign in.** This project has no APNs auth key, so the
iOS SDK cannot do silent-push device verification and falls back to reCAPTCHA;
`appVerificationDisabledForTesting` is set under `__DEV__` so a whitelisted number bypasses it
entirely. Sign in with a number registered under **Authentication → Sign-in method → Phone →
Test phone numbers**, and its code. None is committed here — a test credential belongs to
whoever is running the app, not to the repository.

A property of the environment, not the implementation: the same code signs in with any number
once an APNs key is uploaded, which is the first item in
[`docs/prod-readiness.md`](./docs/prod-readiness.md).

**2. React Native is pinned to 0.80.3.** RN 0.81+ requires Xcode 16.1; this machine has 16.0.
0.80.3 is the newest line that builds here and still ships React 19 with the compiler. Every
native dependency is pinned to the release line that matches it, so bumping one in isolation is
not safe.

**3. Tasks are not scoped per user.** The supplied API is one shared mockapi.io resource with no
owner field and no authentication, so every signed-in user sees the same list. Sign-in proves
identity and gates the app; it does not partition the data.

---

## Running it

Prerequisites: macOS with **Xcode 16.0** and its iOS 18.0 simulator runtime, Node 22 via `nvm`,
Ruby with Bundler. Nothing to configure — `GoogleService-Info.plist` and the API base URL are
committed, because neither is a secret: the API is unauthenticated and the plist holds only
public client identifiers.

```bash
nvm use                       # Node 22.23.2, pinned in .nvmrc
npm ci
bundle install                # installs CocoaPods itself, once
bundle exec pod install --project-directory=ios
npm run ios                   # builds and launches on the iPhone 16 Pro simulator
```

`npm run ios` starts Metro itself if one is not running. The first pod install and native build
take several minutes; everything after is incremental. Then sign in with your test number.

```bash
npx tsc --noEmit              # exits 0
npm run lint                  # 0 errors, 0 warnings
npm test                      # 749 tests across 65 suites
```

`npm run lint` prints several `[boundaries][warning]` lines first. Those are deprecation notices
the plugin writes to stdout, not findings; the run still reports zero problems. FW-01 in
[`docs/future-work.md`](./docs/future-work.md).

One end-to-end flow, a declared bonus in the spec:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash   # once
maestro test -e TEST_PHONE=+972500000000 -e TEST_CODE=000000 .maestro/task-lifecycle.yaml
```

The two parameters are your test number and its code; the flow signs in only when no session is
restored, so they go unused on a warm run. It rejects a duplicate title, creates a task, deletes
it through the confirmation sheet, and leaves the shared API as it found it. It stops short of the
offline cycle on purpose: Maestro drives taps but cannot assert what reached the server, and that
assertion is the whole point of the offline claim.

`android/` ships exactly as the CLI template generated it. It has never been built.

---

## What it does

Phone sign-in, then a task list. Tasks carry a title, description, free-text category,
completion flag, and optional expiry; you can create, edit, complete, delete, and search by
title. Expiry is derived at render rather than stored, so a task expires with no mutation.

Every write works offline and is sent when the network returns. Failures are told apart by what
can be done about them — a refused change is rolled back and reported until a later one lands,
while a list the server will not hand over takes the foreground as a sheet with a retry, because
nothing else would re-run it. Calendar is a declared placeholder; Settings holds sign-out.

---

## Checking the edge cases by hand

The interesting behaviour is in the failure paths, and none of it needs a rebuild. Three levers,
in the order of how faithful they are.

**The API itself — for everything the server can refuse.** Rename the `tasks` resource in the
mockapi dashboard and every request 404s while the app stays online, which is exactly the case
the UI has to tell apart from being offline.

| Do this                     | Expect                                                                     |
| --------------------------- | -------------------------------------------------------------------------- |
| Reopen the app              | A sheet — "Could not load your tasks" — over the cached list, with a retry |
| Add a task                  | It appears, then rolls back, and the banner reports the rejection          |
| Restore the name, add again | It reaches the server and the rejection banner clears itself               |

The cached list staying visible behind the sheet is the point: without the sheet it is
indistinguishable from a complete one.

Nothing is rebuilt, reloaded, or restarted, so the sync engine under test is the one that has
been running the whole time.

**DNS — for the offline cycle.** The Simulator has no airplane mode, and turning the host's Wi-Fi
off is a bad simulation: the simulator process keeps an unsatisfied route after the interface
returns and fails every request with `-1009` until it is restarted, which looks exactly like an
application defect. Break name resolution instead — the route stays satisfied and the running
process recovers the moment it is restored.

```bash
networksetup -setdnsservers Wi-Fi 127.0.0.1   # offline
networksetup -setdnsservers Wi-Fi empty       # back online
```

Offline, create and edit tasks: the banner turns red, the changes are on screen immediately.
Force-quit and reopen — they are still there, and the list renders before any request. Restore
DNS: the banner turns green and counts down the queue. Then check the server rather than the UI,
because the UI is the thing under test:

```bash
curl -s "https://67c98b60102d684575c282fe.mockapi.io/api/v1/tasks?p=1&l=50" \
  | jq '.[] | {id, title, is_done}'
```

The edit must have landed against the id the create was assigned, not against the local one.

**`API_BASE_URL` — if you would rather not touch the dashboard.** Point
`src/shared/api/config.ts` at a missing path and press Cmd+R in the simulator; it is a JS
constant, so no rebuild. Same 404s as the first lever, at the cost of a reload — which recreates
the engine, so it cannot show you a banner clearing itself.

**The rest, no lever needed.** A task whose expiry has passed renders muted with a disabled
checkbox while Edit and Delete stay live; one completed before it expired still reads as
completed. A duplicate title disables the submit button and says why. Delete a task from the
mockapi dashboard while the app is offline, then reconnect: the queued update against it is
dropped in silence, because the record being gone is the outcome the user asked for and there is
nothing to report. Both empty states — no tasks at all, and no search results — carry different
copy and different actions.

Two things that look like bugs and are not: an error banner outranks "syncing", so the pending
count is hidden while a rejection is on screen, and the reconnect can lag by five seconds — see
Known limitations.

---

## Architecture — the decisions worth arguing about

Rules in [`docs/architecture/`](./docs/architecture/), reasoning in
[`docs/specs/SPEC-001-focus-flow-todo/`](./docs/specs/SPEC-001-focus-flow-todo/). Only what a
reader would otherwise have to reverse-engineer is here.

Layers are Feature-Sliced — `app → navigation → screens → widgets → features → entities →
shared` — enforced by `eslint-plugin-boundaries` at error severity, because a convention nobody
checks is a convention nobody keeps.

**The mutation queue sits in front of the API client, not behind a local database.** TanStack
Query's own persistence was the cheap option and the wrong tool: its cache models reads, not a
write that must survive a restart and replay in order. A local database as the source of truth is
the robust answer and the wrong size — its schema and migrations would outweigh the feature set.
What ships is a persisted queue in front of a typed API client, with the query cache as the read
model, hydrated synchronously from MMKV before the first fetch. It is
`src/features/task-sync/model/taskSyncEngine.ts` — 387 lines, of which about 280 are code and
the rest is the reasoning behind the parts that are not obvious — with no React in it, which is
what makes the offline claim testable in-process.

Its invariants: entries drain strictly in order, so a create precedes the update that depends on
it; a confirmed create's server id replaces the local one in the cache **and** in every entry
queued behind it; transport failures and 5xx retry with backoff; a terminal 4xx rolls the change
back and drops the entry. A rejection is reported until the next change lands, and survives the
successes drained in the same pass — otherwise a queue holding one bad entry and one good one
would raise the message and remove it between two frames, leaving a rollback on screen with
nothing saying why.

**Server state never enters the Zustand store.** Task data lives in TanStack Query; Zustand holds
only client state that outlives a screen — the session, the in-flight verification, the sync
status — read through typed selector hooks. Mirroring server data into a client store is what
produces two sources of truth and, a week later, a list and a detail screen that disagree.

Two conventions the lint rules enforce, each buying something hard to retrofit. React Native
primitives are banned outside `src/shared/ui/atoms/` by `no-restricted-imports`, so no hex string
exists above the token layer, the 44 pt touch floor comes from hit area rather than inflated
visual sizes, and lists recycle by default. A screen may not import a route constant — `ROUTES`
sits above `screens/` in the layer order, so the boundary rule rejects it — which is why screens
take callbacks and mount in tests with no navigation container.

One more is a review rule rather than a lint rule, and it is worth being exact about the
difference: the React Compiler is on, so hand-written `memo` / `useMemo` / `useCallback` is
banned, but nothing in `eslint.config.mjs` checks that. It holds today because the codebase
contains none; it is enforced by whoever reads the diff.

---

## Testing

749 tests across 65 suites, over the two places a defect stays invisible until it corrupts data —
title validation and the mutation queue — plus RNTL component tests over the row states, the
empty states, and validation feedback. No test touches the live service.

**Every task was mutation-tested:** once the tests went green, deliberate defects were introduced
to prove each test could fail. A green suite that cannot fail is worse than no suite, because
everyone trusts it. It paid for itself twice — a real queue defect where a delete and an update
against the same task made the record reappear for a frame, and a missing test where the momentum
card counted the filtered view rather than the whole list.

Its ceiling is worth stating: several defects were found only by running the app — an input
overlaying its container at zero opacity, which rendered correctly and could not be tapped; a
centred title wide enough to sit on the back arrow; icons pinned to the top of their containers
by a line height equal to their font size. All geometry or colour, none of it visible to a
testing library.

---

## Known limitations

Beyond the three at the top, and all of them recorded with a repro and a proposed fix:

- **The offline cycle is verified by hand.** The DNS lever above plus a `curl` read-back; the
  harness that would automate it is FW-06.
- **The OTP field's hidden input ghosts through in the error state.** The boxes are drawn over
  one real input held at 2% opacity, because UIKit will not hit-test a transparent view — which
  is invisible on the white box it was calculated against, and faintly visible on the error
  state's pale red one. BUG-001.
- **A first sync failing with anything but an `ApiError` is still silent.** Reachable only via a
  defect in our own code; closing it means giving `ApiFailure` a kind for "this app has a bug".
  BUG-002.
- **A response the app cannot parse reads as "Offline",** because an unreadable body is
  classified as a transport failure — so a proxy's HTML error page blames the user's connection
  for a server that answered. FW-07.
- **Connectivity is inferred from request outcomes, not from a native module,** which costs a
  beat at each end. The app cannot know it is offline until something fails, so going offline
  and touching nothing shows no banner; and once it does know, it only believes the network is
  back when an attempt succeeds, which is at the next five-second probe. Between those it stays
  offline and says so — the probe buys an attempt, it does not announce a recovery. Neither end
  can wedge the queue.
- **One residual sync race:** a mutation draining _while_ the first sync's pages are in flight
  can be dropped from the cache until the next app start. The write reaches the server either
  way. FW-04.
- **Calendar is a placeholder; the app is single-theme, English-only, LTR.** Declared scope cuts.

---

## Repository map

| Path                                   | What is there                                                    |
| -------------------------------------- | ---------------------------------------------------------------- |
| `src/`                                 | the application, in Feature-Sliced layers                        |
| `docs/architecture/`                   | the profile, the principles, the conventions, the coding rules   |
| `docs/specs/SPEC-001-focus-flow-todo/` | the epic, the task breakdown, the execution plan, the checklists |
| `docs/bugs/`                           | defect reports — two open, BUG-001 and BUG-002                   |
| `docs/future-work.md`                  | deferred work that is not a defect, FW-01 to FW-07               |
| `docs/prod-readiness.md`               | the console steps no agent can perform                           |
| `docs/workflow.md`                     | how the work was planned and shipped                             |
| `.maestro/`                            | the one end-to-end flow                                          |

Start with the epic for the reasoning, `docs/architecture/PROJECT-PROFILE.md` for the
constraints, and `src/features/task-sync/model/taskSyncEngine.ts` for the code that is actually
interesting.
