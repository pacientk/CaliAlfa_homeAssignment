import { useIsSessionInitialising, useIsSignedIn } from '@features/auth';
import { NavigationContainer } from '@react-navigation/native';
import { AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { AuthStack } from '../navStacks/AuthStack';
import { MainStack } from '../navStacks/MainStack';
import { makeRootNavigatorStyles } from './RootNavigator.styles';

/**
 * The one navigation container, holding whichever stack the session calls for.
 *
 * Swapping the stack rather than navigating between them is what makes FR-5 true by
 * construction: when signed out the tab shell is not merely off-screen, it is not mounted, so
 * there is no route for a stale deep link or a back gesture to reach.
 *
 * Nothing is rendered while the session is still initialising. On a cold start Firebase's auth
 * listener has not reported yet, so "no session" and "not asked yet" carry the same value, and
 * a navigator that switched on the session alone would show a returning user the welcome
 * screen for one frame before replacing it — a flash the user reads as a bug. Holding the
 * first frame costs nothing, because the listener answers from disk.
 */
export const RootNavigator = (): JSX.Element => {
  const styles = useThemedStyles(makeRootNavigatorStyles);
  const isSessionInitialising = useIsSessionInitialising();
  const isSignedIn = useIsSignedIn();

  if (isSessionInitialising) {
    return <AppView style={styles.holding} />;
  }

  return <NavigationContainer>{isSignedIn ? <MainStack /> : <AuthStack />}</NavigationContainer>;
};
