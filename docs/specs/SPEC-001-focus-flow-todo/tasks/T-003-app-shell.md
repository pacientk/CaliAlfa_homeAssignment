# T-003: FSD skeleton, navigation, and providers

## Meta

| Field         | Value                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type          | infra                                                                                                                                                                                                  |
| Size          | M                                                                                                                                                                                                      |
| Risk          | medium                                                                                                                                                                                                 |
| Status        | not-started                                                                                                                                                                                            |
| Languages     | TS                                                                                                                                                                                                     |
| Scope paths   | `src/app/**`, `src/navigation/**`, `src/shared/lib/strings.ts`, `src/screens/**` (placeholders only), `App.tsx`, `index.js`, `assets/fonts/**`, `react-native.config.js`, `ios/**` (font linking only) |
| Blocked by    | T-002                                                                                                                                                                                                  |
| Blocks        | T-008, T-009, T-011, T-012                                                                                                                                                                             |
| Epic sections | §11.1, §9.2                                                                                                                                                                                            |

## Goal

Stand up the layer skeleton, the navigation graph, and the provider stack, with every screen
present as a placeholder, so that later tasks add content rather than structure.

## Context

The architecture is the first evaluation criterion, and it is judged by reading the tree.
Creating all seven layers with their barrels up front — even where a layer is briefly empty —
makes the shape legible and gives the boundary lint rule something to enforce.

## Scope

- The seven FSD directories with barrels, matching `docs/architecture/conventions.md`.
- `ROUTES` constants and the typed param list.
- An auth stack and an authenticated tab navigator, switched by session state.
- `AppProviders`: theme, safe area, query client.
- `src/shared/lib/strings.ts` with every user-facing string used by the placeholders.
- Placeholder screens for all eight destinations.

### Bundle the icon font — carried over from T-002

`AppIcon` renders Material Symbols Outlined ligatures, but only the four Inter files are
bundled today, so every icon currently renders its ligature name as literal text. Download
`MaterialSymbolsOutlined` as a static `.ttf`, put it in `assets/fonts/`, re-run
`npx react-native-asset`, and revert whatever it writes under `android/` — that platform is out
of scope. Verify the face actually registers rather than assuming it: build, install on the
simulator, and check the font resolves, the way T-001 verified Inter.

**Nothing on any screen looks right until this lands**, which is why it is here rather than
deferred.

### Replace the template root

`App.tsx` and the root `__tests__/` are React Native template scaffolding and are currently
lint-ignored by name in `eslint.config.mjs`. Delete both, point `index.js` at the real app
root under `src/app/`, and remove those two entries from the lint ignore list. The lint run
must stay clean afterwards.

## Out of scope

- Real screen content, auth logic, and data. Later tasks fill these.
- Deep linking.

## Technical specification

### Structure

```
src/
├── app/            AppRoot, AppProviders
├── navigation/     RootNavigator, RootStackParamList, constants/routes, navStacks/{AuthStack,MainTabs}
├── screens/        Welcome, PhoneNumber, VerificationCode, TaskList, NewTask, TaskDetail, Calendar, Settings
├── widgets/        (created empty with a barrel)
├── features/       (created empty with a barrel)
├── entities/       (created empty with a barrel)
└── shared/         api, config, lib, services, store, ui
```

### Navigation

Two stacks under one container. The switch reads a session flag from a Zustand store, which
T-007 replaces with the real Firebase-backed state; until then it is a stub defaulting to
signed-out.

Screen names are only ever referenced through `ROUTES`. A string literal in a `navigate`
call is a review finding.

The tab bar has three tabs — Tasks, Calendar, Settings — with the active tab rendering the
design's filled pill behind its icon.

### Strings

One module exporting a nested frozen object. No user-facing literal appears in a component.
There is no i18n library and no locale switching; the module exists so the seam is in one
place.

## Acceptance criteria

- **AC-1** — Given the app launches signed-out, when it renders, then the Welcome screen
  appears and the tabs are unreachable.
- **AC-2** — Given the session flag is set, when the app renders, then the tab shell appears
  and the auth screens are unreachable.
- **AC-3** — Given a lint run, when a file in `shared/` imports from `features/`, then lint
  fails; and when a file in one feature imports from another feature, then lint fails.
- **AC-4** — Given the tab bar, when a tab is active, then its icon sits in the filled pill
  and its label uses the primary colour.

## Tests

**Strategy** — component tests for the navigator switch; the boundary rules in AC-3 are
verified by running lint against deliberate violations, then deleting them.

**Core scenarios**

- **S-1** — signed-out renders the auth stack — covers AC-1
- **S-2** — signed-in renders the tabs — covers AC-2
- **S-3** — the boundary violations both fail lint, and a legal downward import passes —
  covers AC-3 with its negative case

**Manual verification**

- [ ] All three tabs reachable, active states correct on the simulator

## References

- Epic §11.1, §9.2
- Rules: `docs/architecture/conventions.md` § FSD layers, `coding-rules.md` § Layer boundaries
