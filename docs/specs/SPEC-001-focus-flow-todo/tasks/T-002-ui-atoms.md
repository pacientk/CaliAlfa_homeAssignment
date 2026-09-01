# T-002: UI atom layer

## Meta

| Field         | Value                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Type          | feature                                                                                                       |
| Size          | M                                                                                                             |
| Risk          | medium                                                                                                        |
| Status        | not-started                                                                                                   |
| Languages     | TS                                                                                                            |
| Scope paths   | `src/shared/ui/atoms/**`, plus `src/shared/ui/tokens/primitive/sizes.ts` and the theme group that surfaces it |
| Blocked by    | T-001                                                                                                         |
| Blocks        | T-003, T-008, T-009, T-011, T-012                                                                             |
| Epic sections | §9.3, §16.2                                                                                                   |

## Goal

Build the `App*` primitives so that no other file in the codebase imports a React Native
primitive.

## Context

The atom layer is where the theme, the font-scale cap, the touch-target floor, and the
accessibility defaults are applied once. Every raw `<Text>` elsewhere is a place where all
four silently do not happen — which is why the lint rule blocks them outside this directory.

## Scope

- `AppView`, `AppText`, `AppPressable`, `AppTextInput`, `AppScrollView`, `AppFlashList`,
  `AppIcon`.
- Each in its own package folder with a styles module, an `I<Component>.ts`, a barrel, and
  tests.

## Out of scope

- Composite components — a task row, a chip, a card belong to `entities/` or `widgets/`.
- Any screen.

## Technical specification

### Components

| Component       | Responsibility                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppView`       | A themed `View`. No behaviour beyond passing style through                                                                                                                                          |
| `AppText`       | Typography variants from the theme; caps `maxFontSizeMultiplier` at the theme's single scale cap; default colour from the theme                                                                     |
| `AppPressable`  | Press feedback (the design's 0.98 scale), disabled handling, and the accessibility touch floor via `hitSlop` measured against its own layout. Requires `accessibilityRole` and `accessibilityLabel` |
| `AppTextInput`  | Themed field with default / focused / error / disabled states, an optional label, and an inline error message slot                                                                                  |
| `AppScrollView` | Themed scroll container with the screen's horizontal margin as an option                                                                                                                            |
| `AppFlashList`  | Thin wrapper over `@shopify/flash-list` — the project's only list primitive                                                                                                                         |
| `AppIcon`       | Material Symbols Outlined glyph at a themed size and colour                                                                                                                                         |

### Component dimensions

T-001 deliberately did not create a dimension scale, because it had no call sites. The atoms
are the first call sites: the checkbox is 20, the task row's minimum height 56, control and
floating-button height 52, the OTP box 60, icon tiles 64 and 36. Add
`src/shared/ui/tokens/primitive/sizes.ts` with the values this task actually needs, surface it
on the theme, and take the values from the canvas rather than inventing a ladder. Later screens
extend it the same way.

### Rules that apply to every atom

- Props are a named `I<Component>Props` in `I<Component>.ts`, re-exported from the barrel.
- Styles live in `<Component>.styles.ts` as a `makeXStyles(theme)` factory.
- These files are the only ones permitted to import from `react-native`.
- 150-line limit per file; extract before hitting it.

### The touch floor, precisely

`AppPressable` measures its own layout and applies whatever `hitSlop` is needed to reach
44 pt on each axis. It never inflates its visual size, and the floor is a constant that is
not multiplied by the font scale.

## Acceptance criteria

- **AC-1** — Given any file outside `src/shared/ui/atoms/`, when it imports `View`, `Text`,
  `Pressable`, `TextInput`, `ScrollView`, or `FlatList` from `react-native`, then lint fails.
- **AC-2** — Given an `AppPressable` rendered at 30 × 30, when its accessibility frame is
  measured, then it is at least 44 × 44.
- **AC-3** — Given `AppText` with the OS font size at maximum, when it renders, then the
  applied multiplier does not exceed the theme's cap.
- **AC-4** — Given `AppTextInput` in its error state, when it renders, then the border uses
  the theme's error colour and the message is exposed to accessibility.

## Tests

**Strategy** — React Native Testing Library per atom. The lint boundary in AC-1 is verified
by running the linter against a deliberate violation in a scratch file, then deleting it.

**Core scenarios**

- **S-1** — `AppPressable` fires `onPress` and does not fire when disabled — covers AC-2
- **S-2** — `AppPressable` renders with the role and label it was given — covers AC-2
- **S-3** — `AppText` applies the variant's size and the theme colour — covers AC-3
- **S-4** — `AppTextInput` shows the error message and error styling when given one, and
  neither when not — covers AC-4, and pairs the negative case as VR-05 requires

**Manual verification**

- [ ] Press feedback on `AppPressable` feels immediate on the simulator

## References

- Epic §9.3, §16.2
- Component sheet: artboard D in `Tech Assignment/design/`
- Rules: `docs/architecture/conventions.md` § Component packages
