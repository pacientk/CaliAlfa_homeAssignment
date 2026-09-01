import { startSessionObserver, useIsSessionInitialising, useIsSignedIn } from '@features/auth';
import { createFakeAuthService } from '@features/auth/testing/authServiceDouble';
import { act, renderHook } from '@testing-library/react-native';

/**
 * Cold start. The state this file asserts exists exactly once per process — before the
 * provider's listener has reported anything — so it gets a file of its own, because Jest
 * gives each test file its own module registry and any other case would have written to
 * the store first.
 *
 * What is at stake is the flash: with only "is there a phone number" to go on, a returning
 * user's first frame is the welcome screen, because "no session" and "not asked yet" look
 * identical. `isInitialising` is how a consumer tells them apart.
 */
describe('the session store before the provider has answered', () => {
  it('reports that it is still initialising, and no session yet', async () => {
    const initialising = await renderHook(() => useIsSessionInitialising());
    const signedIn = await renderHook(() => useIsSignedIn());

    expect(initialising.result.current).toBe(true);
    expect(signedIn.result.current).toBe(false);
  });

  it('stops initialising as soon as the provider reports, even when there is no session', async () => {
    const service = createFakeAuthService();
    startSessionObserver(service);
    const initialising = await renderHook(() => useIsSessionInitialising());
    const signedIn = await renderHook(() => useIsSignedIn());

    await act(() => {
      service.emitSession(undefined);
    });

    expect(initialising.result.current).toBe(false);
    expect(signedIn.result.current).toBe(false);
  });
});
