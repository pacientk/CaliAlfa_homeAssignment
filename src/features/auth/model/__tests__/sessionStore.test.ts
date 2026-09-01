import { signIn, signOut, useIsSignedIn } from '@features/auth';
import { act, renderHook } from '@testing-library/react-native';

/**
 * The flag the root navigator switches on. Every case below reads it through the selector
 * hook, because that is the only way a component ever sees it — asserting against the store
 * object would prove something no consumer relies on.
 */
describe('the session stub', () => {
  afterEach(async () => {
    await act(() => {
      signOut();
    });
  });

  it('starts signed out, so a cold launch lands on the auth stack', async () => {
    const { result } = await renderHook(() => useIsSignedIn());

    expect(result.current).toBe(false);
  });

  it('reports a session after signing in', async () => {
    const { result } = await renderHook(() => useIsSignedIn());

    await act(() => {
      signIn();
    });

    expect(result.current).toBe(true);
  });

  it('reports no session again after signing out', async () => {
    const { result } = await renderHook(() => useIsSignedIn());

    await act(() => {
      signIn();
    });
    await act(() => {
      signOut();
    });

    expect(result.current).toBe(false);
  });
});
