# Coding Rules

Specific, enforceable rules for all `src/` code. Read alongside
[principles.md](./principles.md) (philosophy) and [conventions.md](./conventions.md)
(naming, structure, git). Project-specific values resolve against
[PROJECT-PROFILE.md](./PROJECT-PROFILE.md).

Rules marked **[ESLint]** are CI-blocking and must be wired into the config — see
[§ Enforcement](#enforcement). Rules marked **[Review]** are enforced by humans; nobody
should assume CI catches them.

---

## Naming

### Boolean names carry a prefix — `is / has / should / can / did` **[ESLint]**

```ts
// Wrong
const passes = score > threshold;
const loading = true;

// Right
const isPassing = score > threshold;
const isLoading = true;
const hasPermission = roles.includes('admin');
const shouldRedirect = !isAuthenticated;
const canSubmit = isFormValid && !isSubmitting;
const didFetch = response !== null;
```

Applies to local variables, parameters, props, and hook return values. It reads better,
and it makes a boolean that is accidentally a string or a number stand out immediately.

### Props types — `I` prefix, own file **[ESLint]**

```ts
// Wrong
interface Props { … }
type ButtonProps = { … }

// Right — in IButton.ts
interface IButtonProps { … }
```

Component and hook props are always a named `I`-prefixed declaration in a dedicated
`I<Component>.ts` file, imported by the component and re-exported from its barrel. This
holds for a discriminated union too — it still lives in the `I` file and is still named
`I<Component>Props`.

The lint rule is scoped by a `Props$` filter, so domain and token interfaces (`Theme`,
`ColorTokens`, `Task`) keep plain `PascalCase` and are deliberately not prefixed.

### Type aliases — `PascalCase` **[ESLint]**

---

## Imports

### Path aliases, never deep relative traversal **[ESLint]**

```ts
// Wrong
import type { Task } from '../../entities/task/model/Task';

// Right
import type { Task } from '@entities/task';
```

Two-or-more-level relative imports (`../../`) are blocked. Same-directory relatives are
fine. Test files may be exempt.

### Layer boundaries **[ESLint]**

Imports flow downward only:
`app → navigation → screens → widgets → features → entities → shared`

`shared/` imports from nothing above it. Features never import from other features.
Enforce this mechanically — a documented boundary that CI does not check is a boundary
that lasts about three weeks.

### `import type` for type-only imports **[ESLint]**

Auto-fixable. Eliminates a runtime import that exists only for a type.

### Import order — auto-sorted **[ESLint]**

Handled by the sorter; never argued about in review.

### Banned direct imports **[ESLint]**

Maintain a per-project ban list. The recurring entries:

| Banned | Use instead | Why |
|---|---|---|
| `react-native` → `View`, `Text`, `ScrollView`, `Pressable`, `Image` outside `shared/ui/atoms/` | the project's UI primitives | The atom layer is where theming, font-scale caps, touch-target floors, and a11y defaults are applied once |
| `react-native` → `useColorScheme`, `Appearance` (single-theme projects) | the theme hook | Dead branches nobody tests |
| `react-native` → `Linking` | a wrapper service | Unvalidated URLs are an injection surface |
| `react-native` → `I18nManager` outside the i18n service | the i18n service API | Manual direction branching fights native mirroring |
| the raw i18n library outside the i18n service | the project translation hook | One seam, not many |
| the store singleton inside components | typed hooks and selectors | Dependency inversion |

---

## Constants and Types

### No magic numbers **[ESLint: warn]**

```ts
// Wrong
const timeout = setTimeout(fn, 3000);

// Right
const SESSION_TIMEOUT_MS = 3_000;
const timeout = setTimeout(fn, SESSION_TIMEOUT_MS);
```

Keep a short ignore list for genuinely self-evident values (`0`, `1`, `-1`, `2`, `100`).

### Shared constants live in `shared/lib/constants/` **[Review]**

The same literal defined in two features is a bug waiting for one of them to change.

### Use the exported type — never redefine it **[Review]**

A locally re-declared union drifts from its source and the compiler will not tell you.

### Route names via constants **[Review]**

```ts
// Wrong
navigation.navigate('TaskList');

// Right
navigation.navigate(ROUTES.TASK_LIST);
```

---

## TypeScript

### No `any` **[ESLint: error]**

Use `unknown` plus a type guard, or the actual exported type.

### Explicit return types on exported functions and hooks **[ESLint]**

### No non-null assertions **[ESLint: error]**

```ts
// Wrong
const user = getUser()!;

// Right
const user = getUser();
if (!user) throw new Error('User not found');
```

### Floating promises must be handled **[ESLint: error]**

```ts
void doSomethingAsync();               // fire-and-forget, explicitly acknowledged
await doSomethingAsync();              // awaited
doSomethingAsync().catch(handleError); // handled
```

An unhandled rejection in React Native does not crash loudly — it disappears. This rule
is how you find out that a mutation silently failed.

---

## React Native Components

### No raw RN primitives outside the atom layer **[ESLint: error]**

### No inline styles **[ESLint: error]** {#no-inline-styles}

Styles live in a per-component `Component.styles.ts`. Two shapes:

- **Token-derived** → a `makeXStyles(theme)` factory consumed through
  `useThemedStyles(makeXStyles)`. A module-level `StyleSheet.create` runs once at import
  time and therefore cannot read a reactive theme.
- **Purely static** (no theme involvement) → a plain `StyleSheet.create` exported from
  the same styles file.

```tsx
// Wrong
<AppView style={{ marginTop: 16, backgroundColor: '#fff' }} />

// Right — TaskCard.styles.ts
export const makeTaskCardStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.surface.primary,
    },
  });

// Right — TaskCard.tsx
const styles = useThemedStyles(makeTaskCardStyles);
<AppView style={styles.container} />
```

**Three categories — how a style reaches an element:**

1. **Structural or token-derived, non-stateful** → a named key in the factory.
2. **State that is itself a theme constant** (checked/unchecked fill, selected font) →
   named variants in the factory, chosen by a boolean or a lookup:
   `[styles.box, isChecked ? styles.boxChecked : styles.boxUnchecked]`.
3. **Genuinely computed per render** (an animated value, a runtime percentage, a colour
   returned by a resolver) → a narrow inline object. This is the only permitted inline
   style, and it is the documented exception rather than a loophole.

**Caveat about the lint rule.** The off-the-shelf `react-native/no-inline-styles` only
flags *hardcoded literal* inline styles. It does not flag a token-derived inline object
such as `{ gap: theme.spacing.xs }`. So the linter enforces "no literal styles"; the
broader "token-derived styles belong in the styles file" is enforced in review.

### Text direction **[Review]**

Only relevant when the profile includes RTL. Use logical values (`textAlign: 'left'`,
`marginLeft`) and let native mirroring flip them.

```tsx
// Right — flips automatically
textAlign: 'left'

// Wrong — 'right' also flips, producing left-alignment: a real bug
textAlign: I18nManager.isRTL ? 'right' : 'left'

// Wrong — reversing an array to "fix" RTL that native layout already handles
const tabs = I18nManager.isRTL ? [...TABS].reverse() : TABS;
```

Exception: content that must stay physically LTR in every locale — account numbers,
amounts, code.

### Accessibility on interactive elements **[ESLint: warn or error]**

Every interactive element carries `accessibilityRole` and `accessibilityLabel`.

### Nesting depth: 3 **[ESLint: error]**

Flatten with guard clauses.

### Component file size: 150 lines **[ESLint]**

Blank lines and comments excluded. Tests and stories exempt.

---

## Performance

The philosophy from [principles.md](./principles.md) holds: no speculative
micro-optimisation. The rules below are the exceptions, because they are **structural**
decisions that are expensive to retrofit.

### Lists — a recycling list by default **[Review]**

- **Every scrollable data list uses a recycling list** (`@shopify/flash-list`) through the
  project's list atom — not `FlatList`. Recycling views instead of mounting and unmounting
  them is the difference between a smooth and a janky feed on a low-end device, and it is
  the kind of decision that is expensive to retrofit once the list has grown callers.
- This is one of the few places where YAGNI does not apply. The cost is one dependency and
  one atom, paid once; the cost of switching later is every list screen in the app plus a
  re-test of each. A list that is short today is short because the seed data is small.
- If the list atom does not exist yet when you need a list, creating it — the atom plus the
  dependency — is part of your task. Do not fall back to `FlatList` "for now".
- A genuinely fixed, non-scrolling collection (three to five static rows that cannot grow —
  a settings menu, a segmented control) may be mapped inside a scroll view. Virtualisation
  has overhead too; do not cargo-cult it onto something that is not a list.
- `keyExtractor` returns a stable domain id, never the array index.
- `renderItem` is a named function or a stable component reference, never an inline
  closure that declares a component.
- No anonymous objects or arrays in list-item props — in a list, that is a re-render
  multiplier.

### Store subscriptions **[Review]**

Subscribe to the narrowest slice the component needs — never the whole store, never a
whole slice for one field. Derived data reads through a memoised selector so unrelated
writes do not re-render.

### Animations **[Review]**

Animations run on the UI thread: Reanimated worklets, or `Animated` with
`useNativeDriver: true`. Never animate through `setState` loops. A layout property that
cannot go native needs a design rethink, not a JS-thread animation.

### Don't memoise by hand **[Review]** {#dont-memoise-by-hand}

**Only applies when the profile says the React Compiler is enabled.** The compiler
auto-memoises components and hooks, so hand-written `React.memo`, `useMemo`, and
`useCallback` are a last resort, not the default tool.

Adding manual memoisation requires all three to hold, stated in the PR description:

1. A profiler capture shows real wasted render cost. "It might re-render" is not a
   justification.
2. The compiler demonstrably did not memoise that code — usually because it bailed out on
   a Rules-of-React violation. Check the `react-hooks/*` warnings for the file first:
   fixing the violation is the correct fix and lets the compiler do the work.
3. The value is genuinely expensive **and** the props being stabilised are actually
   referentially stable — otherwise `React.memo` compares, re-renders anyway, and you
   have paid for nothing.

Two traps that recur in review:

- Memoising an object that is spread into a freshly allocated array one line later. The
  stable reference is destroyed immediately; the memo cost remains.
- `React.memo` on a component whose re-renders originate **inside** a child — the parent
  never re-rendered in the first place.

Keep the compiler-safety lint rules at `error`, so a purity or set-state-in-render
violation fails the build instead of silently un-optimising the file. Note the inverse is
not detectable by lint: a file can be warning-free and still bail out. Only compiler
output settles whether a file was memoised.

**When the compiler is off**, this section inverts: hand memoisation is legitimate, but
still requires a demonstrated render problem rather than a hunch.

---

## `eslint-disable` Comments

Every disable carries a description **[ESLint: error]**.

```ts
// Wrong
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// Right
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party API returns an untyped shape; tracked in TICKET-123
```

A disable without a matching enable is forbidden.

---

## Security

CI-blocking in `src/` **[ESLint: error]**:

- `eval()` with a dynamic expression
- `RegExp` built from a non-literal — a user-supplied pattern is a denial-of-service
- Object access by a non-literal key — warn rather than error, but always reviewed

Beyond lint:

- No secrets in the repository. Configuration comes from the environment.
- No user data in logs.
- Every URL opened externally passes through a validating wrapper.

---

## Enforcement

The rules above are only real if the config backs them. The Mizrahi original leaned on
several bespoke ESLint rules; the portable equivalents below use published plugins.

Baseline plugin set:

```
@typescript-eslint  eslint-plugin-react  eslint-plugin-react-hooks
eslint-plugin-react-native  eslint-plugin-import  eslint-plugin-simple-import-sort
eslint-plugin-boundaries  eslint-plugin-security  eslint-plugin-jest
prettier + eslint-config-prettier
```

Mapping from rule to mechanism:

| Rule | Mechanism |
|---|---|
| Boolean prefixes, `I`-prefixed props, `PascalCase` types | `@typescript-eslint/naming-convention` with a `Props$` filter for the `I` prefix |
| No raw RN primitives outside atoms | `no-restricted-imports` on `react-native` named imports, with an override that re-allows them under `src/shared/ui/atoms/**` |
| Layer boundaries, no cross-feature imports | `eslint-plugin-boundaries` (element types per FSD layer + an allowed-downward matrix), or `import/no-restricted-paths` zones |
| No deep relative traversal | `no-restricted-imports` with the pattern `../../*` |
| `import type` | `@typescript-eslint/consistent-type-imports` |
| Import order | `simple-import-sort/imports` + `/exports` |
| No `any`, no `!`, floating promises, explicit boundary types | the `@typescript-eslint` type-aware rule set — requires `parserOptions.project` |
| No inline styles | `react-native/no-inline-styles` (literal styles only — see the caveat above) |
| Magic numbers | `no-magic-numbers` with a small ignore list, `warn` in `src/`, `error` in the domain layer |
| Depth, file size | `max-depth: 3`, `max-lines` with `skipBlankLines` and `skipComments` |
| Accessibility | `react-native-a11y` rules on interactive elements |
| Disable descriptions | `eslint-comments/require-description` |
| Security | `eslint-plugin-security` |
| Formatting | Prettier as the sole formatter; `eslint-config-prettier` last, so the two never fight |

Additional gates worth having from day one:

- A pre-commit hook (`husky` + `lint-staged`) running Prettier and ESLint on staged files.
- A `commitlint` conventional-commit check.
- A CI job that runs, in order: type-check, lint, test. In that order — a type error
  makes every lint and test failure downstream noise.

When a rule genuinely has no off-the-shelf equivalent and matters enough, write a local
ESLint rule and put it under `eslint-local-rules/`. That is a real cost; spend it only on
boundaries that would otherwise erode.
