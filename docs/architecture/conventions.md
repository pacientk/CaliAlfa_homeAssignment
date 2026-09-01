# Naming and Structure Conventions

Applies to all code in a React Native project that adopts this rule set. Read alongside
[principles.md](./principles.md) and [coding-rules.md](./coding-rules.md). Project-specific
values — component prefix `<Prefix>`, state manager, branch names — resolve against
[PROJECT-PROFILE.md](./PROJECT-PROFILE.md).

---

## File Structure

### Feature-Sliced Design layers

```
src/
├── app/            # Bootstrap: root component, providers, store creation
├── navigation/     # Navigators, route constants, deep linking, navigation ref
├── screens/        # Screen composition — one directory per screen
├── widgets/        # Screen-level composite blocks reused across screens
├── features/       # Self-contained user-facing capabilities
├── entities/       # Domain models and their display components
└── shared/         # Cross-cutting infrastructure, dependency-free of everything above
    ├── api/        # HTTP client, interceptors, typed service functions
    ├── config/     # Runtime configuration and startup validation
    ├── lib/        # Utilities, constants, pure helpers
    ├── services/   # Long-lived services: logging, analytics, storage, i18n
    ├── store/      # Store setup and typed hooks
    └── ui/
        ├── atoms/      # Primitive components — the only place that touches raw RN
        ├── molecules/  # Small compositions of atoms
        └── tokens/     # Design token layer and theme provider
```

**Imports flow downward only:**
`app → navigation → screens → widgets → features → entities → shared`

A layer may import from any layer below it and never from one above or beside it.
Cross-feature imports are forbidden — two features that need the same thing share it
through `entities/` or `shared/`. This is the rule that keeps an FSD codebase from
degenerating into a graph, and it is worth enforcing mechanically
([coding-rules.md § Layer boundaries](./coding-rules.md#layer-boundaries)).

### Token layer

```
shared/ui/tokens/
├── primitive/          # Raw scales: palette, spacing, radii, font sizes. No semantics
├── themes/
│   ├── types.ts        # Theme interface contract
│   └── <theme>.ts      # One file per theme declared in the profile
├── typography.ts       # Named text style objects
├── ThemeProvider.tsx   # Context provider
├── useTheme.ts         # Theme hook
├── useThemedStyles.ts  # Bridge from a styles factory to a themed StyleSheet
└── index.ts            # Public barrel
```

Two levels, always: **primitive** values carry no meaning (`purple100`, `spacing16`);
**semantic** tokens carry a role (`colors.surface.primary`, `colors.text.disabled`).
Components consume semantic tokens only. A component that reaches for a primitive shade
has skipped the abstraction that makes re-theming possible.

> **When a project has more than one theme:** a semantic role token and a generic shade
> can hold the *same* value in one theme and *different* values in another. Substituting
> one for the other type-checks, passes the tests that run against the first theme, and
> silently breaks the second. Whenever a diff touches a colour token, read its value in
> **every** theme file before approving.

### Component packages — one folder per component

Every component owns a folder named after it. All files belonging to that component live
inside: the `.tsx`, its styles module, its props interface, and its tests. A component is
never a set of loose files sitting beside another component's files.

A package groups one main component with its sub-components and shared modules. The
package root contains only the public barrel and folders:

```
BottomSheet/                        # package
├── index.ts                        # the ONLY external entry point
├── BottomSheet/                    # main component — its own folder, like any other
│   ├── BottomSheet.tsx
│   ├── BottomSheet.styles.ts
│   ├── IBottomSheet.ts
│   └── __tests__/BottomSheet.test.tsx
├── BottomSheetHeader/              # sub-component — same rule, recursively
│   ├── BottomSheetHeader.tsx
│   ├── BottomSheetHeader.styles.ts
│   └── IBottomSheetHeader.ts
└── hooks/
    └── useBottomSheet.ts
```

- The barrel re-exports from nested files.
- **External code imports the package barrel only** — never a nested file. Nested files
  are private to the package; the package's own tests may deep-import within it.
- A simple component with no sub-components still gets a folder — a single-file
  component today becomes a package tomorrow, and moving it later churns every import.

### Screens

One directory per screen, `PascalCase`, containing the screen component, any screen-local
configuration, and a barrel. Group related screens under a domain directory when a domain
has several.

---

## Naming

| Type | Convention | Example |
|---|---|---|
| Component | `PascalCase` | `<Prefix>Text.tsx`, `TaskCard.tsx` |
| Screen | `PascalCase` + `Screen` suffix | `TaskListScreen.tsx` |
| Hook | `camelCase`, `use` prefix | `useTheme.ts`, `useAuth.ts` |
| Service | `PascalCase` + `Service` suffix | `StorageService.ts` |
| Props interface | `I` prefix + `PascalCase` + `Props` | `ITaskCardProps` |
| Domain / token type | `PascalCase` noun, no prefix | `Theme`, `ColorTokens`, `Task` |
| Primitive constant group | `PascalCase` | `Palette`, `Spacing`, `FontSize` |
| Store slice / store file | `camelCase` + `Store` or `Slice` | `authStore.ts`, `authSlice.ts` |
| Test file | mirrors the source file + `.test` | `TaskCard.test.tsx` |
| Boolean | `is` / `has` / `should` / `can` / `did` prefix | `isLoading`, `hasPermission` |

### Kebab-case

- Documentation directories and spec slugs: `kebab-case`.
- Never in TypeScript source: `PascalCase` for components, `camelCase` for everything else.

### The `I` prefix, deliberately scoped

`I`-prefixing is applied to **props types only** — `ITaskCardProps`, `IUseAuthReturn`.
Domain types, entities, and token interfaces stay unprefixed (`Task`, `Theme`,
`ColorTokens`). The prefix exists to make "this is the public surface of a component"
instantly visible in an import list; extending it to every interface just adds noise. If
a project prefers no prefix at all, change it here and in the lint rule — but change it
in one direction, everywhere, on day one.

---

## Components

- **No raw React Native primitives** (`View`, `Text`, `ScrollView`, `Pressable`, `Image`)
  outside `shared/ui/atoms/`. Everywhere else uses the project's primitives.
  The reason is not stylistic: the primitive layer is where the theme, the font-scale cap,
  the touch-target floor, and the accessibility defaults are applied once. Every raw
  `<Text>` is a place where all four silently do not happen.
- **Props are a named, `I`-prefixed declaration in a dedicated `I<Component>.ts` file**,
  re-exported from the component barrel. Never inlined in the `.tsx`.
- **150-line hard limit** per component file.
- **No business logic in render.**
- **No `any`.**

### Atoms

- Atoms are the only files permitted to import from `react-native` primitives.
- Every atom reads design values through the theme hook. No literals.
- Atoms require the theme provider to render — tests wrap them or use a test provider.

### Import paths

- Use path aliases when crossing layers. Never `../../` traversal across a layer boundary.
- Relative imports are fine within the same directory (`./types`, `./ITaskCard`).
- Use `import type` for type-only imports.

---

## Typography and Tokens

- **Typography** — named styles from the token layer. Never compose
  `{ fontSize, fontWeight, lineHeight }` inline.
- **Colour** — `theme.colors.*` only.
- **Spacing** — `theme.spacing.*`, consumed as-is. No scaling helpers.
- **Shadow** — `theme.shadows.*`.
- **Radius** — `theme.borderRadius.*`.
- **Themes not in the profile do not exist.** If the profile declares a single light
  theme, the OS-appearance APIs are banned outright rather than left as dormant branches
  that nobody tests.

---

## TypeScript

- **No `any`** — `unknown` plus narrowing, or the concrete exported type.
- **Explicit return types** on all exported functions and hooks.
- **Named interfaces** — never inline in parameters or props.
- **`strict: true`**, not overridden.
- **No type assertions (`as X`)** in production code unless structurally necessary, and
  then with a comment explaining why.
- **No non-null assertions (`!`)** — narrow or throw.
- **`Readonly<T>`** on objects consumers must not mutate.

---

## Test Code Quality

Test files are held to the same standard as production code.

- No `any` — mocks satisfy the real exported types.
- No commented-out tests. A dead test is dead code; delete it.
- No unused variables assigned in setup and never read.
- Extract deeply nested callbacks; prefer `for…of` over nested `forEach`.
- **Mock only what you must.** A test that can run against the real implementation should.
- Prefer alias-based `jest.mock('@layer/module')` over relative paths — it survives moves.
- Global native-module mocks live in a root `__mocks__/`; per-test overrides use a factory.
- Test names state the behaviour, not the implementation: "rejects a title that is only
  whitespace", not "calls validateTitle".

---

## Git

### Branches

```
<integration branch>              # protected
feature/<ticket-or-slug>
fix/<ticket-or-slug>
chore/<slug>
hotfix/<ticket-or-slug>
```

Never commit directly to the protected integration branch when the profile requires pull
requests. On a solo short-lived project the profile may relax this to short-lived
branches merged locally with `--no-ff`, which still produces a readable history.

### Commit format

```
{type}({scope}): {description}

feat(tokens): add the light theme token set
fix(TaskCard): derive the disabled colour from the theme
chore(deps): update react-native to 0.84.1
docs(spec-021): mark the design-token epic complete
test(useTaskSync): cover the offline replay path
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`.
Scope: the FSD layer, the feature, or the component touched.

### Language

- **Conversation** — any language.
- **Everything committed** — English. Code, comments, commit messages, branch names, PR
  titles and bodies, documentation, specs, test descriptions.
