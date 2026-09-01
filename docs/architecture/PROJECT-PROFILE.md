# Project Profile — Focus & Flow

The single place where project-specific choices live. `principles.md`,
`conventions.md`, `coding-rules.md`, and the `rn-engineer` agent resolve their
placeholders against this file.

Requirements and the reasoning behind them: `../requirements.md`.

---

## Identity

| Key | Value | Notes |
|---|---|---|
| Project name | Focus & Flow (`CaliAlfa`) | The RN project is named `CaliAlfa` because the Firebase iOS app is registered under `org.reactjs.native.example.CaliAlfa`, which the CLI template derives from the project name |
| Component prefix | `App` | `AppText`, `AppView`, `AppPressable`, … |
| Platforms | **iOS only** | Android is out of scope; the `android/` directory ships unmodified and unverified |
| Bundle identifier | `org.reactjs.native.example.CaliAlfa` | Fixed by the Firebase registration — do not change |
| React Native | **0.80.3** | Pinned by the toolchain: RN 0.81+ requires Xcode 16.1 and the build machine has Xcode 16.0. 0.80.3 is the newest line that builds here, and it still ships React 19 with React Compiler support. Rationale recorded in `Tech Assignment/REQUIREMENTS.md` |
| React | 19.1.0 | |
| Node | 22.23.2 | Pinned in `.nvmrc`; the template requires `>= 22.11.0` |
| Package manager | npm | |

## Stack

| Concern | Choice | Rule impact |
|---|---|---|
| Client state | **Zustand** | Redux is forbidden by the assignment. Stores are consumed through typed selector hooks, never by importing the store into a component |
| Server state | **TanStack Query** | Task data is never mirrored into the Zustand store |
| HTTP transport | `fetch` behind typed services in `shared/api/` | No transport calls inline in features |
| Local persistence | **MMKV** | Holds the task cache and the mutation queue |
| Navigation | **React Navigation** (native stack + bottom tabs) | Screen names only via `ROUTES` |
| Lists | **FlashList** via `AppFlashList` | Recycling list is the default — see `coding-rules.md § Lists` |
| Animation | **Reanimated** | UI thread only |
| Auth | **React Native Firebase** — phone number + OTP | Project `todolist-b4a98` |
| Styling | `StyleSheet` + token theme, `ThemeProvider` + `useThemedStyles` | |
| Forms | hand-rolled | Three fields and one validation rule set; a form library would not pay for itself |
| Tests | Jest + React Native Testing Library | |
| E2E | Maestro — bonus, if the schedule allows | |
| React Compiler | **on** | Hand-written `React.memo` / `useMemo` / `useCallback` is banned — see `coding-rules.md § Don't memoise by hand` |

## Product constraints

| Key | Value | Rule impact |
|---|---|---|
| Themes | **single light theme** | The OS-appearance APIs (`useColorScheme`, `Appearance`) are banned outright. No dark-mode branches |
| Localisation | **none** — English only | User-facing strings still route through `shared/lib/strings.ts`; no literals in components |
| Text direction | **LTR only** | The RTL rules in `coding-rules.md` do not apply. No `I18nManager` anywhere |
| Accessibility | basic — role and label on every interactive element, adequate hit areas | No full audit |
| Minimum OS | iOS 16 | |
| Offline support | **full offline-first** | Local cache read before any network call, mutation queue with retries, optimistic updates with rollback, last-write-wins on conflict, temporary local ids reconciled after sync |

## Architecture

| Key | Value |
|---|---|
| Architecture | Feature-Sliced Design |
| Layer order (imports flow downward only) | `app → navigation → screens → widgets → features → entities → shared` |
| Path aliases | `@app @navigation @screens @widgets @features @entities @shared @ui @lib @services @config` |
| Component-file line limit | 150 (`max-lines`, warn) |
| Max nesting depth | 3 (`max-depth`, error) |

## Process

| Key | Value |
|---|---|
| Methodology | **Spec-driven development** — the `spec-development` skill, vendored at `.claude/skills/`. No implementation without an approved spec |
| Integration branch | `main` |
| Branch naming | `feature/<slug>`, `fix/<slug>`, `chore/<slug>` |
| Ticket prefix | none |
| Pull requests | **not required** — solo, single-day scope. Short-lived branches merged into `main` with `--no-ff`, which keeps the history readable without PR overhead |
| Commit format | `{type}({scope}): {description}` |
| Language of artefacts | Code, comments, commits, docs, tests: **English**. Conversation: any |

## Lint severity

Deliberate deviations from the defaults in `coding-rules.md`, chosen for a
single-day build:

| Rule | Severity | Reason |
|---|---|---|
| `no-magic-numbers` | warn | Would block progress at speed; reviewed at the end |
| `max-lines` (150) | warn | Same |
| `@typescript-eslint/no-explicit-any` | error | Non-negotiable |
| `@typescript-eslint/no-non-null-assertion` | error | Non-negotiable |
| `@typescript-eslint/no-floating-promises` | error | An unhandled rejection in the sync layer is invisible otherwise |
| layer boundaries | error | The architecture is an explicit evaluation criterion |
| `react-native/no-inline-styles` | error | |
| `max-depth` (3) | error | |

## Definition of Done

1. `npx tsc --noEmit` exits 0
2. `npm run lint` reports 0 errors and no new warnings
3. `npm test` green, with new tests covering the task's acceptance criteria
4. For UI work: verified on the iPhone 16 Pro simulator for at least the golden path
