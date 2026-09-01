import { useContext } from 'react';

import { ThemeContext } from './ThemeProvider';
import type { Theme } from './themes/types';

/** Thrown when a component reads the theme from outside `ThemeProvider`. */
export class ThemeProviderMissingError extends Error {
  public constructor() {
    super('useTheme was called outside ThemeProvider. Wrap the tree in <ThemeProvider>.');
    this.name = 'ThemeProviderMissingError';
  }
}

/**
 * The only way a component may read a design value.
 *
 * Throws instead of falling back to a default: a silent default would let a whole subtree
 * render unthemed and look almost right, which is far harder to notice than a crash.
 */
export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);

  if (theme === null) {
    throw new ThemeProviderMissingError();
  }

  return theme;
};
