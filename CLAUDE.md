# Focus & Flow — React Native to-do application

A take-home technical assignment: an offline-first to-do app with Firebase phone
authentication, built on Feature-Sliced Design.

**Scope is one working day.** The goal is to demonstrate sound engineering decisions on a
small amount of code, not to ship a product. Prefer the decision that is easy to explain
over the one that is merely clever.

---

## Read before writing any code

1. [`docs/architecture/PROJECT-PROFILE.md`](./docs/architecture/PROJECT-PROFILE.md) — the
   stack, the constraints, the lint severities, the Definition of Done. **Every rule in
   the documents below resolves its placeholders here. Read it first.**
2. [`docs/architecture/principles.md`](./docs/architecture/principles.md) — KISS, DRY,
   YAGNI, SOLID, decomposition rules, the quality checklist
3. [`docs/architecture/conventions.md`](./docs/architecture/conventions.md) — naming, file
   structure, git
4. [`docs/architecture/coding-rules.md`](./docs/architecture/coding-rules.md) — the
   enforceable rules and how each one is enforced

## Workflow

See [`docs/workflow.md`](./docs/workflow.md) for how work is planned and shipped — three
tracks, six phases, gates.

**Spec-driven development is mandatory.** No implementation without an approved spec under
`docs/specs/`. The `spec-development` skill is vendored at `.claude/skills/`.

The `rn-engineer` agent (`.claude/agents/rn-engineer.md`) is the default executor for
implementation tasks; it loads the documents above before writing code.

---

## The rules that break most often

- **No raw React Native primitives outside `src/shared/ui/atoms/`** — use `AppView`,
  `AppText`, `AppPressable`, `AppTextInput`, `AppFlashList`.
- **No design literals.** Every colour, spacing, radius, and font size comes from the
  theme. No hex strings, no numeric spacing in components.
- **Styles live in `Component.styles.ts`** — a `makeXStyles(theme)` factory consumed via
  `useThemedStyles`. Inline objects only for values computed per render.
- **Props are `I`-prefixed, in their own `I<Component>.ts`**, re-exported from the barrel.
- **Imports flow downward only:**
  `app → navigation → screens → widgets → features → entities → shared`. No cross-feature
  imports. Aliases across layers, relative only inside a directory.
- **Booleans carry `is` / `has` / `should` / `can` / `did`.**
- **No `any`, no `!`, no floating promises.** Explicit return types on exports.
- **150 lines per component file, nesting depth 3.**
- **No hand-written `React.memo` / `useMemo` / `useCallback`** — the React Compiler is on.
- **No hardcoded user-facing strings** — everything through `src/shared/lib/strings.ts`.
- **Single light theme.** `useColorScheme` and `Appearance` are banned.
- **Accessibility role and label on every interactive element.**

## Hard constraints from the assignment

- **No Expo. No Redux.** Client state is Zustand, server state is TanStack Query.
- **iOS only.** The `android/` directory is unmodified and unverified.
- Bundle identifier is `org.reactjs.native.example.CaliAlfa` and must not change — the
  Firebase iOS app is registered under it.
- React Native is pinned to **0.80.3**: 0.81+ requires Xcode 16.1 and the build machine has
  16.0.
- Everything committed is in **English** — code, comments, commit messages, docs, tests.

## Commands

```bash
nvm use                 # Node 22.23.2, pinned in .nvmrc
npm start               # Metro
npm run ios             # build and run on the simulator
npx tsc --noEmit        # type-check
npm run lint            # ESLint
npm test                # Jest
```

## Definition of Done

Type-check exits 0 → lint reports 0 errors → tests green with new tests covering the
task's acceptance criteria → UI verified on the iPhone 16 Pro simulator for the golden
path. In that order.
