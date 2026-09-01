import type { Theme } from './themes/types';
import { useTheme } from './useTheme';

/**
 * Bridges a `makeXStyles(theme)` factory to the current theme.
 *
 * A module-level `StyleSheet.create` runs once at import time and so cannot read the theme;
 * the factory shape is what lets a component keep its styles in `Component.styles.ts` and
 * still resolve them from tokens. See `docs/architecture/coding-rules.md § No inline styles`.
 *
 * There is no memoisation here on purpose: the React Compiler is enabled for this project
 * and hand-written `useMemo` is banned unless a profiler capture says otherwise.
 */
export const useThemedStyles = <TStyles>(factory: (theme: Theme) => TStyles): TStyles => {
  const theme = useTheme();

  return factory(theme);
};
