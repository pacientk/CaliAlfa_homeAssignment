import { useIsSignedIn } from '@features/auth';
import { NavigationContainer } from '@react-navigation/native';
import type { JSX } from 'react';

import { AuthStack } from '../navStacks/AuthStack';
import { MainStack } from '../navStacks/MainStack';

/**
 * The one navigation container, holding whichever stack the session calls for.
 *
 * Swapping the stack rather than navigating between them is what makes AC-1 and AC-2 true by
 * construction: when signed out the tab shell is not merely off-screen, it is not mounted, so
 * there is no route for a stale deep link or a back gesture to reach.
 *
 * `useIsSignedIn` is a stub until T-007 replaces it with the Firebase-backed store; the shape
 * this component reads does not change.
 */
export const RootNavigator = (): JSX.Element => {
  const isSignedIn = useIsSignedIn();

  return <NavigationContainer>{isSignedIn ? <MainStack /> : <AuthStack />}</NavigationContainer>;
};
