import { RootNavigator } from '@navigation/RootNavigator';
import type { JSX } from 'react';

import { AppProviders } from '../AppProviders';

/**
 * The component `index.js` registers. It is deliberately two lines: everything that used to
 * accumulate in a React Native `App.tsx` — providers, navigation, session — has a layer of
 * its own, and the root's only job is to put them in that order.
 */
export const AppRoot = (): JSX.Element => (
  <AppProviders>
    <RootNavigator />
  </AppProviders>
);
