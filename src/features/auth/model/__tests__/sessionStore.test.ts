import {
  signIn,
  signOut,
  startSessionObserver,
  useIsSignedIn,
  useSessionPhoneNumber,
} from '@features/auth';
import { createFakeAuthService } from '@features/auth/testing/authServiceDouble';
import { signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { act, renderHook } from '@testing-library/react-native';

/**
 * The store as the app sees it. Every case reads through the selector hooks, because that
 * is the only way a component ever sees this state — asserting against the store object
 * would prove something no consumer relies on.
 *
 * The provider is a double rather than the Firebase SDK: what is under test here is that
 * the listener drives the store in both directions, which is what makes session
 * restoration (AC-2) and sign-out (AC-3) true. That Firebase itself emits is verified on
 * the simulator, not here.
 *
 * The cold-start `isInitialising` flag is asserted in `sessionStore.coldStart.test.ts`:
 * it is observable once per process, so it needs a module registry no other case has
 * already written to.
 */

const mockFirebaseSignOut = jest.mocked(firebaseSignOut);

const TEST_PHONE = '+972528287009';
const OTHER_PHONE = '+972500000000';

describe('the session store', () => {
  afterEach(async () => {
    await act(() => {
      signOut();
    });
    jest.clearAllMocks();
  });

  it('reports a session with the number the provider reported', async () => {
    const service = createFakeAuthService();
    startSessionObserver(service);
    const signedIn = await renderHook(() => useIsSignedIn());
    const phone = await renderHook(() => useSessionPhoneNumber());

    await act(() => {
      service.emitSession(TEST_PHONE);
    });

    expect(signedIn.result.current).toBe(true);
    expect(phone.result.current).toBe(TEST_PHONE);
  });

  it('reports no session when the provider reports no user', async () => {
    const service = createFakeAuthService();
    startSessionObserver(service);
    const signedIn = await renderHook(() => useIsSignedIn());
    const phone = await renderHook(() => useSessionPhoneNumber());

    await act(() => {
      service.emitSession(TEST_PHONE);
    });
    await act(() => {
      service.emitSession(undefined);
    });

    expect(signedIn.result.current).toBe(false);
    expect(phone.result.current).toBeUndefined();
  });

  it('replaces the number when the provider reports a different user', async () => {
    const service = createFakeAuthService();
    startSessionObserver(service);
    const phone = await renderHook(() => useSessionPhoneNumber());

    await act(() => {
      service.emitSession(TEST_PHONE);
    });
    await act(() => {
      service.emitSession(OTHER_PHONE);
    });

    expect(phone.result.current).toBe(OTHER_PHONE);
  });

  it('stops following the provider once the observer is unsubscribed', async () => {
    const service = createFakeAuthService();
    const unsubscribe = startSessionObserver(service);
    const signedIn = await renderHook(() => useIsSignedIn());

    unsubscribe();
    await act(() => {
      service.emitSession(TEST_PHONE);
    });

    expect(service.listenerCount()).toBe(0);
    expect(signedIn.result.current).toBe(false);
  });

  it('clears the session immediately on sign-out, without waiting for the provider', async () => {
    const service = createFakeAuthService();
    startSessionObserver(service);
    const signedIn = await renderHook(() => useIsSignedIn());
    const phone = await renderHook(() => useSessionPhoneNumber());
    await act(() => {
      service.emitSession(TEST_PHONE);
    });

    await act(() => {
      signOut();
    });

    expect(signedIn.result.current).toBe(false);
    expect(phone.result.current).toBeUndefined();
  });

  it('asks the provider to end the session on sign-out', async () => {
    await act(() => {
      signOut();
    });

    expect(mockFirebaseSignOut).toHaveBeenCalledTimes(1);
  });

  it('seeds a session with no number when the placeholder screen signs in', async () => {
    const signedIn = await renderHook(() => useIsSignedIn());
    const phone = await renderHook(() => useSessionPhoneNumber());

    await act(() => {
      signIn();
    });

    expect(signedIn.result.current).toBe(true);
    expect(phone.result.current).toBeUndefined();
  });
});
