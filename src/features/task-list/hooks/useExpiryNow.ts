import { useEffect, useState } from 'react';
import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';

const nowIso = (): string => new Date().toISOString();

/**
 * The instant every row on this pass is judged against.
 *
 * Expiry is derived rather than stored, so something has to decide when "now" is. Reading the
 * clock during render would make the component impure and would judge each row against a
 * slightly different moment; holding it in state fixes one instant per pass.
 *
 * It is refreshed when the app returns to the foreground, which is the case the task block
 * names: a deadline that passes while the app is backgrounded must be reflected the moment
 * the user comes back, and that is the only way meaningful wall-clock time goes by without
 * this screen re-rendering. `AppState` is a native event emitter rather than a UI primitive,
 * so it is not one of the `react-native` imports the atom-layer rule fences off.
 */
export const useExpiryNow = (): string => {
  const [now, setNow] = useState(nowIso);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status !== 'active') {
        return;
      }

      setNow(nowIso());
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return now;
};
