import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@ui/tokens';
import type { JSX } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { IAppProvidersProps } from './IAppProviders';

/**
 * One client for the life of the process. It is created at module scope rather than inside
 * the component because a client rebuilt on a render would throw the cache away with it.
 * T-006 configures its defaults — retry, stale time, the persister — and this file is where
 * that lands.
 */
const queryClient = new QueryClient();

/**
 * The provider stack, outermost first.
 *
 * `SafeAreaProvider` is outermost because the tab bar measures the home-indicator inset while
 * it renders; the query client sits above the theme because nothing in the theme needs data
 * and a data consumer may well need the theme.
 */
export const AppProviders = ({ children }: IAppProvidersProps): JSX.Element => (
  <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  </SafeAreaProvider>
);
