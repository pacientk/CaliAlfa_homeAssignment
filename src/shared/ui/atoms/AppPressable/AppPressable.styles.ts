import { StyleSheet } from 'react-native';

/**
 * The design's press feedback: `Pressed · scale 0.98`, from the button row of artboard D.
 *
 * These two styles involve no theme, so they are a plain `StyleSheet.create` rather than a
 * `make…(theme)` factory — see `docs/architecture/coding-rules.md § No inline styles`.
 *
 * The scale is a component-scoped constant on purpose. `docs/architecture/principles.md
 * § Sizing` reserves that for a value genuinely unique to one component: every tappable
 * element in the app presses through `AppPressable`, so there is no second call site for a
 * press-feedback scale and nothing for the theme to unify.
 */
const PRESSED_SCALE = 0.98;
const RESTING_SCALE = 1;

export const appPressableStyles = StyleSheet.create({
  resting: { transform: [{ scale: RESTING_SCALE }] },
  pressed: { transform: [{ scale: PRESSED_SCALE }] },
});
