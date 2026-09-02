# Focus & Flow

An offline-first to-do application for iOS. React Native 0.80.3, TypeScript, Firebase phone
authentication, a mockapi.io backend, and a persisted mutation queue that makes every write
survive both a lost network and a process restart.

Built as a take-home assignment over a single working day.

---

## Read this first — three things that will otherwise surprise you

**1. Only the Firebase test phone number can sign in.**

There is no APNs auth key for this Firebase project, so the iOS SDK cannot perform silent-push
device verification; it falls back to reCAPTCHA, and `appVerificationDisabledForTesting` is set
under `__DEV__` so that the whitelisted test number bypasses verification entirely. Real numbers
therefore cannot complete sign-in on this build. Use:

| Phone number       | Code     |
| ------------------ | -------- |
| `+972 52-828-7009` | `123456` |

This is a property of the environment, not of the implementation — the same code signs in with
any number once an APNs key is uploaded. Uploading one is the first item in
[`docs/prod-readiness.md`](./docs/prod-readiness.md).

**2. React Native is pinned to 0.80.3.**

RN 0.81 and above require Xcode 16.1; the build machine has Xcode 16.0. 0.80.3 is the newest
line that builds here, and it still ships React 19 with React Compiler support. Every native
dependency is pinned to the release line that matches it — Reanimated 3.18, FlashList 2.0,
react-native-screens 4.11, safe-area-context 5.4, MMKV 3.3, React Native Firebase 22.4. Bumping
one of them in isolation is not safe on this toolchain.

**3. Tasks are not scoped per user.**

The supplied API is a single shared mockapi.io resource with no owner field and no
authentication, so every signed-in user sees the same list. Sign-in proves identity and gates
the app; it does not partition the data. Adding an owner column is the only fix, and it is not
available on the supplied backend.

---

## Running it

Prerequisites: macOS with **Xcode 16.0** and its iOS 18.0 simulator runtime, Node 22 via `nvm`,
and Ruby with Bundler. There is nothing to configure — the Firebase `GoogleService-Info.plist`
and the API base URL are committed, because neither is a secret: the API is unauthenticated and
the plist contains only public client identifiers.

```bash
nvm use                       # Node 22.23.2, pinned in .nvmrc
npm ci

bundle install                # installs CocoaPods itself, once
bundle exec pod install --project-directory=ios

npm start                     # Metro, in its own terminal
npm run ios                   # builds and launches on the iPhone 16 Pro simulator
```

The first pod install and the first native build take several minutes; everything after that is
incremental. `npm run ios` starts Metro on its own if one is not already running, so the
separate `npm start` is a convenience rather than a requirement.

Then sign in with the test number and code above.

### Checks

```bash
npx tsc --noEmit              # exits 0
npm run lint                  # 0 errors, 0 warnings
npm test                      # 696 tests across 61 suites
```

There is also one end-to-end flow, declared a bonus in the spec and shipped:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash   # once
maestro test .maestro/task-lifecycle.yaml
```

It signs in if the session is not already restored, rejects a duplicate title, creates a task,
deletes it through the confirmation sheet, and leaves the shared API exactly as it found it. It
deliberately stops short of the offline cycle: Maestro can drive the taps but cannot assert what
reached the server, and that assertion is the whole point of the offline claim.

`npm run lint` prints several `[boundaries][warning]` lines before its report. Those are
deprecation notices printed by `eslint-plugin-boundaries` on stdout, not lint findings; the run
still reports zero problems. Tracked as FW-01 in [`docs/future-work.md`](./docs/future-work.md).

### iOS only

`android/` ships exactly as the CLI template generated it. It has never been built and is not
part of the deliverable.

---

## What it does

Phone sign-in, then a task list. Tasks carry a title, a description, a free-text category, a
completion flag, and an optional expiry. You can create, edit, complete, and delete them, and
search the list by title. Expiry is derived at render rather than stored, so a task becomes
expired without any mutation — an expired task's row is muted and its checkbox disabled while
Edit and Delete stay live, and a task completed before it expired still reads as completed.

Every write works offline. A task created with no network is in the list immediately, survives
being force-quit, and is sent when the network returns. A banner says when there is unsent work.

Calendar and Settings are the other two tabs. Calendar is a declared placeholder; Settings holds
sign-out.

---

## Architecture — the decisions worth arguing about

The rules are in [`docs/architecture/`](./docs/architecture/) and the reasoning is in
[`docs/specs/SPEC-001-focus-flow-todo/`](./docs/specs/SPEC-001-focus-flow-todo/). This section is
only the handful of choices a reader would otherwise have to reverse-engineer.

Layers are Feature-Sliced — `app → navigation → screens → widgets → features → entities →
shared` — and the direction is enforced by `eslint-plugin-boundaries` at error severity, because
the architecture is an explicit evaluation criterion and a convention nobody checks is a
convention nobody keeps.

**The mutation queue sits in front of the API client, not behind a local database.** Three
shapes were on the table. TanStack Query's own persistence and optimistic updates would have
been the cheapest, and it is the wrong tool: the query cache models cached reads, not a write
that has to survive a process restart and replay in order behind the writes that came before it.
A local database as the source of truth — WatermelonDB, SQLite — with sync as a background
reconciler is the robust answer and the wrong size; its schema, migrations, and observable
queries would have outweighed the entire feature set. What ships is a persisted queue in front of
a typed API client, with the query cache as the read model: the UI reads through TanStack Query,
which hydrates synchronously from MMKV before its first fetch; writes go to the queue, which
applies them optimistically to the cache, persists itself, and drains against the network. Around
200 lines of real logic in `src/features/task-sync/model/taskSyncEngine.ts`, with no React in it
at all, which is what makes the whole offline claim testable in-process. The React hooks in the
same feature are a thin binding over it.

The invariants that shape the queue: entries drain strictly in order, so a create always precedes
the update that depends on it; a confirmed create's server id replaces the local id in the cache
**and** in every later queued entry that targets it; transport failures and 5xx retry with
backoff; a terminal 4xx rolls the optimistic change back and drops the entry rather than retrying
forever. Each of those has a test that reads storage back rather than asserting that a helper was
called.

**Server state never enters the Zustand store.** Task data lives in TanStack Query and nowhere
else. Zustand holds only what is genuinely client state and outlives a single screen — the
session, the in-flight verification, the sync status — and each is consumed through a typed
selector hook rather than by importing the store into a component. State that belongs to one
screen, such as the search query, stays in that screen's hook and never reaches a store at all.
Mirroring server data into a client store is the cheap decision that produces two sources of
truth and, a week later, a bug where the list and the detail screen disagree.

**The atom layer exists so that design decisions have exactly one home.** Raw React Native
primitives are banned outside `src/shared/ui/atoms/`; components compose `AppView`, `AppText`,
`AppPressable`, `AppTextInput`, `AppFlashList`. It buys three things that are hard to retrofit:
every colour, spacing, radius, and font size resolves from the theme rather than from a literal,
so there is no hex string anywhere above the token layer; the 44 pt touch floor is reached
through hit area inside `AppPressable` rather than by inflating each visual size; and lists are
recycling by default, because swapping a `FlatList` for a `FlashList` later means touching every
list screen.

**A screen may not import a route constant.** `ROUTES` lives in `navigation/`, which is _above_
`screens/` in the layer order, so a screen importing it fails lint. Screens take callbacks —
`onCreateTask`, `onOpenTask` — and the navigators bind them to routes. The screens are therefore
mountable in a test without a navigation container, which is why every screen has render tests
rather than only the navigator having them.

Two smaller ones. Forms are hand-rolled: three fields and one validation rule set do not repay a
form library. The React Compiler is on, so hand-written `React.memo` / `useMemo` / `useCallback`
is banned — an exception would need a profiler capture showing the compiler bailed out, and
fixing the bail-out would be the real fix.

---

## Testing

696 tests across 61 suites: unit tests over the two places where a defect stays invisible until
it corrupts data — title validation and the mutation queue — and React Native Testing Library
component tests over the row states, the empty states, and the form's validation feedback. Tests
never touch the live service; the API client is exercised against recorded shapes and the queue
against a fake transport.

**Every task was mutation-tested.** After a task's tests went green, deliberate defects were
introduced into the code under test to prove each test could actually fail. This is the part of
the engineering worth pointing at, because a green suite that cannot fail is worse than no suite:
it is a green suite that everyone trusts.

It paid for itself twice. It found a real defect in the queue — a delete and an update issued
against the same task made the record reappear for a frame — and one missing test in the list,
where the momentum card was counting the filtered view rather than the whole list and nothing
noticed.

It also has a ceiling, and the ceiling is worth stating. Three defects were found only by running
the app on a simulator and could not have been caught by any test written at this level: a text
input overlaying its own container at zero opacity, which rendered correctly and could not be
tapped; a centred navigation title wide enough to sit on top of the back arrow; and the residue of
the first of those, which the delivery pass found and which is described under Known limitations
below. All three are geometry or colour, and none of them is something the testing library can see.

---

## Known limitations

Beyond the three at the top:

- **The offline cycle is verified manually, not automatically.** Going offline, restarting the
  process, and reconnecting are not things this test setup can drive; the verification is the
  checklist in `docs/specs/SPEC-001-focus-flow-todo/epic.md` §18.4, walked by hand and confirmed
  by reading the API with `curl` rather than by trusting the UI. It passes: a task created and
  then edited with no network survives a force-quit, and both the create and the edit reach the
  server on reconnect, the edit against the server id the create was assigned.
- **The OTP field's hidden input is faintly visible in the error state.** The six code boxes are
  a picture drawn over one real text input, which is held at 2% opacity rather than 0 because
  UIKit will not hit-test a fully transparent view. Two per cent is invisible on the white
  resting box the constant was calculated against, but the error state fills the box with pale
  red, and against that the raw six-digit string ghosts through behind the first digit. Cosmetic,
  reproducible, and filed with its repro and its one-file fix as BUG-001 in `docs/bugs/`.
- **The offline banner may lag a reconnect by up to five seconds.** Connectivity is inferred from
  request outcomes rather than from a native network module — the reasoning is in
  `src/shared/services/connectivity/outcomeConnectivity.ts` — so a recovered network is noticed
  by the next probe rather than by an OS callback. Self-correcting, and it cannot wedge the
  queue, but it is a real difference from what a NetInfo-based app would show.
- **Calendar is a placeholder.** It is declared as one on the artboard and it ships as one.
- **One residual sync race.** A mutation that drains _while_ the first sync's pages are still in
  flight can be dropped from the cache until the next app start. The write itself reaches the
  server either way, so nothing is lost permanently. FW-04 in `docs/future-work.md` has the full
  shape and the fix.
- **Single light theme, English only, LTR only.** All three are deliberate scope cuts recorded in
  the project profile, not oversights.

---

## Repository map

| Path                                   | What is there                                                    |
| -------------------------------------- | ---------------------------------------------------------------- |
| `src/`                                 | the application, in Feature-Sliced layers                        |
| `docs/architecture/`                   | the profile, the principles, the conventions, the coding rules   |
| `docs/specs/SPEC-001-focus-flow-todo/` | the epic, the task breakdown, the execution plan, the checklists |
| `docs/bugs/`                           | defect reports — one open, BUG-001                               |
| `docs/prod-readiness.md`               | the console steps no agent can perform                           |
| `docs/future-work.md`                  | deferred work that is not a defect                               |
| `docs/workflow.md`                     | how the work was planned and shipped                             |
| `.maestro/`                            | the one end-to-end flow                                          |

Start with the epic if you want the reasoning, `docs/architecture/PROJECT-PROFILE.md` if you want
the constraints, and `src/features/task-sync/model/taskSyncEngine.ts` if you want the code that
is actually interesting.
