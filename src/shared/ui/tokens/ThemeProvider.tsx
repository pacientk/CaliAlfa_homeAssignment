import type { JSX } from 'react';
import { createContext } from 'react';

import type { IThemeProviderProps } from './IThemeProvider';
import { lightTheme } from './themes/light';
import type { Theme } from './themes/types';

/**
 * `null` rather than `lightTheme` is the point of this context: a subtree rendered outside
 * the provider must fail loudly in `useTheme` instead of quietly rendering with a default.
 */
export const ThemeContext = createContext<Theme | null>(null);

/**
 * Supplies the single light theme. The project declares one theme
 * (`docs/architecture/PROJECT-PROFILE.md`), so this provider resolves nothing at runtime —
 * it exists to give every component one seam to read design values through.
 */
export const ThemeProvider = ({ children }: IThemeProviderProps): JSX.Element => (
  <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>
);
