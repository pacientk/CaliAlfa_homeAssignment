# Development Principles

Applies to all code in a React Native project that adopts this rule set. Run the
checklist at the end after every implementation task.

Read alongside [conventions.md](./conventions.md) (naming, structure, git) and
[coding-rules.md](./coding-rules.md) (enforceable rules). Project-specific choices —
component prefix, state manager, theming, localisation — resolve against
[PROJECT-PROFILE.md](./PROJECT-PROFILE.md).

---

## KISS — Keep It Simple

Write the simplest solution that correctly solves the problem. Complexity is a
liability, not a feature.

- One function = one clear purpose. If the name needs "and", split it.
- Prefer ten lines of readable code over three lines of clever code.
- No speculative abstractions. Solve what is in front of you.
- If a simpler approach produces the same result, use it.

## DRY — Don't Repeat Yourself

Every piece of knowledge has a single authoritative representation.

- Two occurrences of the same logic is a warning; three is a rule — extract it.
- Shared logic goes to `shared/lib/` or a dedicated hook in the owning layer.
- Design token values live in one place; the semantic layer imports from there and
  never re-declares a value.
- **DRY applies to knowledge, not to shape.** Two components that happen to look alike
  today are not duplication. Merging them into one component with a `variant` flag is
  usually a mistake that costs more than the repetition saved.

## YAGNI — You Aren't Gonna Need It

Do not implement anything that is not required right now.

- No "just in case" parameters, flags, or config options.
- No generic infrastructure built for a single use case.
- No backwards-compatibility shims until a consumer exists.
- No capabilities the profile says are out of scope — not dark mode, not extra locales,
  not desktop breakpoints.
- Requirements change. Code written for an imagined future is usually wrong and always
  costs maintenance.

**Where YAGNI does not apply.** A handful of decisions are *structural*: cheap to make now,
expensive to retrofit once the codebase has consumers. List virtualisation, the layer
boundary, the token layer, and the animation thread are in this set — see
[coding-rules.md § Performance](./coding-rules.md#performance). YAGNI governs features and
abstractions, not the shape of the foundation.

## SOLID

### S — Single Responsibility

One component, hook, or function does one job.

- Business logic lives in hooks (`use*.ts`), not in components.
- Complex derived state becomes a named variable, not an expression buried in JSX.
- A provider resolves and provides. It does not also observe the OS, persist
  preferences, and fire analytics.

### O — Open/Closed

Extend by composition, not by modification.

- Shared UI primitives accept style overrides but define their defaults from tokens.
  Never edit a primitive to accommodate one caller's styling — wrap it.

### L — Liskov Substitution

A subtype must be usable wherever its base type is, without surprising the caller.

- Do not weaken a prop contract in a wrapper (making a required prop optional while the
  parent still relies on it being present).

### I — Interface Segregation

Types and interfaces are named declarations — never inlined in parameters or props.

```ts
// Wrong
const Text: React.FC<{ variant?: 'body' | 'title'; style?: TextStyle }> = ...

// Correct
interface ITextProps {
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
}
const Text: React.FC<ITextProps> = ...
```

Applies to component props, hook return types, and every exported function signature.

### D — Dependency Inversion

Depend on abstractions, not on concrete implementations.

- Components read design values through the theme hook, never by importing a theme
  object directly.
- Features reach the network through typed service functions, never by constructing an
  HTTP call inline.
- The state store is consumed through typed hooks or selectors, never by importing the
  store singleton into a component.

---

## Occam's Razor

Among competing solutions, prefer the one with the fewest assumptions.

- Before adding an abstraction, ask whether it reduces complexity or merely relocates it.
- Prefer React Native built-ins and existing project utilities over a custom
  implementation.
- A new file, hook, or context must earn its place. The default answer is: reuse what
  already exists.

---

## Component Decomposition

### Rules

- **Hard limit: 150 lines per component file** (blank lines and comments excluded).
  Over the limit means mandatory extraction into a sub-component or a hook.
- **One visual concern per component.** A form field, a card header, a list row — each
  is its own component.
- **No logic in render.** Derived values become named variables; event handlers become
  named functions declared outside the returned JSX.
- **No components declared inside components.** A function that returns JSX from inside
  `return()` remounts its whole subtree on every render — extract it.
- **No inline styles**, except values that genuinely cannot be pre-computed (animated
  values, a percentage derived at runtime). See
  [coding-rules.md § No inline styles](./coding-rules.md#no-inline-styles).

### Where an extracted component goes

| Scope | Location |
|---|---|
| Reusable across features | `shared/ui/atoms/` or `shared/ui/molecules/` |
| Feature-specific sub-component | inside the parent component's package |
| Screen-level block | `widgets/<WidgetName>/` |
| Domain display component bound to an entity | `entities/<Entity>/ui/` |

### Checklist

- [ ] Can this block of JSX be named and extracted? Extract it.
- [ ] Is this logic reusable across screens? Move it to `shared/lib/` or a hook.
- [ ] Does this component do two visually distinct things? Split it.
- [ ] Does this file exceed 150 lines? Split it.

---

## Sizing and Design Values

- **Token-only sizing.** Every numeric design value — dimensions, padding, margin, gap,
  font size, line height, border radius — comes from the theme. No raw numeric literals
  for design values in component or screen code.
- **No responsive-scaling helpers.** `scaleWidth`, `scaleHeight`, `pxToRem` and similar
  must not exist. Design values are authored in device-independent logical units; React
  Native already handles pixel density per platform. Multiplying them by a screen-width
  ratio produces a layout that is wrong on every device except the one it was tuned on.
- **Adding a value.** If the design specifies a size that has no token, search the
  existing primitives first. If it is genuinely missing, extend the primitive scale and
  surface it on the theme — never inline the literal at the call site, never derive it
  by arithmetic from a neighbouring token.
- **New token groups are universal, not per-component.** Component-scoped tokens are
  reserved for values that are genuinely unique to one component and have no plausible
  reuse.
- **Font-scale awareness.** When the OS text size grows, layout must grow with it rather
  than clip. Scale *vertical* rhythm — minimum heights, vertical padding, gaps between
  stacked text — and leave *structural* values raw: horizontal padding, corner radii,
  icon glyph sizes, border widths. Use `minHeight`, never a fixed `height`, on any
  container holding text. Cap the scale factor once, in the theme, and never re-derive
  a multiplier inside a component.
- **Visual size is not the touch target.** An element's visual height is whatever the
  design says. The accessibility floor (44 pt iOS, 48 dp Android) is reached through hit
  area, not by inflating the visual. Put that logic in the shared pressable primitive so
  no component hard-codes a touch minimum. The floor is a constant and is never
  multiplied by the font scale.

---

## Code Quality Checklist

Run over every file changed in the current session.

### Universal

- [ ] No `any` — use `unknown` plus narrowing, or the real exported type
- [ ] Explicit return types on all exported functions and hooks
- [ ] Named interfaces — no inline prop objects
- [ ] Guard clauses — early return instead of nested conditionals
- [ ] No dead code — no commented-out blocks, no unused imports
- [ ] Intent-revealing names — no `tmp`, `data2`, `val`, `res`
- [ ] No colour literals in component code — theme colours only
- [ ] No numeric design literals — theme spacing and radius only

### React Native components

- [ ] No raw React Native primitives outside the shared UI primitive layer
- [ ] No inline styles, except genuinely per-render computed values
- [ ] Styles defined in the component's own styles module
- [ ] Text direction handled by logical values and native mirroring, not by manual
      direction branching (only relevant if the profile includes RTL)
- [ ] No OS-appearance APIs when the profile declares a single theme
- [ ] Accessibility role and label on every interactive element
- [ ] User-facing strings come from the strings or i18n module, never inline literals

### Hooks and state

- [ ] No hand-written memoisation when the React Compiler is enabled — see
      [coding-rules.md § Don't memoise by hand](./coding-rules.md#dont-memoise-by-hand)
- [ ] Server data is not duplicated into the client store — the server-state library
      owns it
- [ ] Store subscriptions read the narrowest slice the component actually needs
- [ ] The theme hook is called at component level, never inside a loop or a condition
- [ ] Effects have correct dependencies and clean up subscriptions and timers

### Verification

- [ ] Type-check exits 0
- [ ] Lint reports 0 errors and introduces no new warnings
- [ ] Tests green, with new tests covering every acceptance criterion — negative cases
      paired with positive ones
- [ ] UI work verified on a simulator or device for at least the golden path

---

## Git Discipline

- One logical change per commit. Do not batch unrelated fixes.
- Commit message format: `{type}({scope}): {description}` — see
  [conventions.md § Git](./conventions.md#git).
- Describe **what** changed and **why**. The code already explains how.
- Never commit directly to the protected integration branch when the profile requires
  pull requests.
