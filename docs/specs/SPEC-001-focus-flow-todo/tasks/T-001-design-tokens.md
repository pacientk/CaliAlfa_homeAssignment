# T-001: Design token layer and theme

## Meta

| Field         | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Type          | feature                                                                |
| Size          | M                                                                      |
| Risk          | medium                                                                 |
| Status        | not-started                                                            |
| Languages     | TS                                                                     |
| Scope paths   | `src/shared/ui/tokens/**`, `assets/fonts/**`, `react-native.config.js` |
| Blocked by    | —                                                                      |
| Blocks        | T-002                                                                  |
| Epic sections | §9.3, §11.2                                                            |

## Goal

Build the two-level token layer and the theme provider so that no component ever needs a
colour, size, or font literal.

## Context

Every rule about styling in `docs/architecture/coding-rules.md` presupposes this layer: the
ban on hex literals, the ban on numeric design values, and the `makeXStyles(theme)` factory
consumed through `useThemedStyles`. Nothing else in the spec can be built to standard until
it exists.

## Scope

- Primitive tokens: palette, spacing scale, radii, font sizes, line heights, font weights,
  shadows. Raw values, no semantics.
- One semantic light theme built on the primitives, with role-named groups.
- `ThemeProvider`, `useTheme`, `useThemedStyles`.
- Inter bundled as an app font and wired into the iOS target.

## Out of scope

- Dark mode, a second theme, or any OS-appearance detection.
- Font-scale arithmetic helpers. Cap the scale once in the theme and stop there.
- Components — those are T-002.

## Technical specification

### Files to create

| Path                                           | Purpose                                         |
| ---------------------------------------------- | ----------------------------------------------- |
| `src/shared/ui/tokens/primitive/palette.ts`    | Raw colour constants                            |
| `src/shared/ui/tokens/primitive/spacing.ts`    | Raw spacing scale                               |
| `src/shared/ui/tokens/primitive/radii.ts`      | Raw corner radii                                |
| `src/shared/ui/tokens/primitive/typography.ts` | Font sizes, line heights, weights, family       |
| `src/shared/ui/tokens/primitive/shadows.ts`    | The two elevation levels                        |
| `src/shared/ui/tokens/themes/types.ts`         | The `Theme` contract                            |
| `src/shared/ui/tokens/themes/light.ts`         | The single theme                                |
| `src/shared/ui/tokens/ThemeProvider.tsx`       | Context provider                                |
| `src/shared/ui/tokens/useTheme.ts`             | Theme hook; throws outside the provider         |
| `src/shared/ui/tokens/useThemedStyles.ts`      | Factory bridge                                  |
| `src/shared/ui/tokens/index.ts`                | Public barrel                                   |
| `assets/fonts/Inter-*.ttf`                     | Regular 400, Medium 500, SemiBold 600, Bold 700 |
| `react-native.config.js`                       | Font asset path                                 |

### Palette — the authoritative list

Extracted from the canvas sources in `Tech Assignment/design/Task app multi-flow design/`.
Do not add a colour that is not here; if the design needs one, it is in the canvas and was
missed.

| Value     | Role in the design                                               |
| --------- | ---------------------------------------------------------------- |
| `#451ebb` | primary — CTAs, active tab, links, focus ring                    |
| `#5d3fd3` | primary container — the momentum card fill                       |
| `#3a18a0` | primary pressed                                                  |
| `#7a63dd` | primary muted — progress track on a filled surface               |
| `#e6deff` | primary fixed — badge and active-icon backgrounds                |
| `#d8ceff` | on primary container                                             |
| `#ffffff` | surface lowest — cards, tab bar                                  |
| `#fdf8ff` | surface / screen background                                      |
| `#f4f2f7` | canvas behind the artboards; not a screen colour                 |
| `#f7f1fe` | surface low                                                      |
| `#f1ecf8` | surface container — expired card fill                            |
| `#ebe6f3` | surface container high — chips, dividers                         |
| `#e6e0ed` | surface container highest — expired chip fill, disabled checkbox |
| `#ddd8e4` | surface dim — disabled checkbox border                           |
| `#1c1a23` | text primary                                                     |
| `#484554` | text secondary, completed title                                  |
| `#797586` | text tertiary, outline, expired title                            |
| `#c9c4d7` | outline variant — unchecked checkbox border                      |
| `#ba1a1a` | error                                                            |
| `#ffdad6` | error container                                                  |
| `#93000a` | on error container                                               |
| `#0f7a52` | success — a checked checkbox and completion only                 |

### Type scale

Inter. Sizes present in the design: 12, 14, 16, 18, 20, 22, 24, 26, 28, 30. Line heights:
16, 18, 20, 22, 24, 28, 32, 34. Weights: 400, 500, 600, 700. Name the variants after their
role (`headline`, `title`, `body`, `label`, `caption`), not after their size, and read the
exact pairing per screen from the canvas sources.

### Radii and elevation

Radii in use: 8, 12, 14, 16, 20, 24, 32, and full (9999). Two elevations only:
`0 4px 12px rgba(0,0,0,0.05)` for cards and rows, `0 8px 24px rgba(93,63,211,0.15)` for
primary buttons, the floating button, and modals. Express both as React Native shadow props
plus an Android elevation, even though Android is out of scope, so the token is complete.

### Contracts

`useTheme(): Theme` returns the theme and throws a named error when called outside the
provider — a silent default here would let a whole subtree render unthemed.

`useThemedStyles<T>(factory: (theme: Theme) => T): T` calls the factory with the current
theme. The factory returns a `StyleSheet.create` result.

## Acceptance criteria

- **AC-1** — Given a component wrapped in `ThemeProvider`, when it calls `useTheme`, then it
  receives the light theme with every group populated.
- **AC-2** — Given a component outside the provider, when it calls `useTheme`, then a named
  error is thrown rather than a default returned.
- **AC-3** — Given the token barrel, when the app is grepped, then no hex literal and no
  numeric design value appears outside `src/shared/ui/tokens/primitive/`.
- **AC-4** — Given the app running on the simulator, when text renders, then it renders in
  Inter at every weight the design uses, not in the system font.

## Tests

**Strategy** — unit tests on the theme shape and on `useTheme`'s failure mode; a render test
for `useThemedStyles`. The font check is manual: a screenshot comparison is the only honest
verification that a font actually loaded.

**Core scenarios**

- **S-1** — every role in the `Theme` contract resolves to a value from `palette.ts` — covers AC-1
- **S-2** — `useTheme` outside the provider throws — covers AC-2
- **S-3** — `useThemedStyles` re-invokes the factory with the theme and returns a stylesheet — covers AC-1

**Manual verification**

- [ ] Text renders in Inter, verified against an artboard screenshot at 400 / 500 / 600 / 700

## References

- Epic §9.3, §11.2
- Design tokens: `Tech Assignment/stitch_modern_todo_list_ui/focus_flow/DESIGN.md`
- Canvas sources: `Tech Assignment/design/Task app multi-flow design/*.dc.html`
- Rules: `docs/architecture/coding-rules.md` § No inline styles, `principles.md` § Sizing
