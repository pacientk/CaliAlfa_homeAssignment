import { TaskSyncProvider } from '@features/task-sync';
import { ThemeProvider } from '@ui/tokens';
import type { JSX } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { IAppProvidersProps } from './IAppProviders';

/**
 * The provider stack, outermost first.
 *
 * `SafeAreaProvider` is outermost because the tab bar measures the home-indicator inset while
 * it renders. `TaskSyncProvider` sits above the theme because nothing in the theme needs data
 * and a data consumer may well need the theme.
 *
 * There is no `QueryClientProvider` of its own here. The client this app uses is not a
 * default one — it is built by `createTaskSyncBindings` already holding the stored task list,
 * with the stale, retry and garbage-collection policy an offline-first cache needs — and
 * `TaskSyncProvider` mounts it. A second client above it would have looked like configuration
 * and served nobody: every query in the app is registered against the first.
 */
export const AppProviders = ({ children }: IAppProvidersProps): JSX.Element => (
  <SafeAreaProvider>
    <TaskSyncProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </TaskSyncProvider>
  </SafeAreaProvider>
);
