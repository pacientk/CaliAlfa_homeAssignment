import { create } from 'zustand';

import type { AuthService } from './AuthService';
import { firebaseAuthService } from './firebaseAuthService';

/**
 * What the app knows about the current session. Three scalars: the provider owns the
 * credential, and mirroring anything else of Firebase's in here would give the app a
 * second source of truth to keep honest.
 */
interface SessionState {
  /**
   * True until the provider's auth listener has reported for the first time.
   *
   * On a cold start the listener has not fired yet, so "no phone number" and "we have not
   * asked yet" are the same value and would render the welcome screen for a frame before
   * flipping to the tab shell. This flag is how a consumer tells them apart and holds the
   * first frame instead of flashing.
   */
  readonly isInitialising: boolean;
  /** Whether a session exists. The flag the root navigator switches on. */
  readonly isSignedIn: boolean;
  /** The signed-in number in E.164, absent when there is no session. */
  readonly phoneNumber?: string;
}

/**
 * Signed out and still asking. Starting from `isSignedIn: false` is the safe default: a
 * consumer that ignores `isInitialising` shows the welcome screen rather than briefly
 * exposing the tab shell to someone who has no session.
 */
const INITIAL_SESSION: SessionState = { isInitialising: true, isSignedIn: false };

/**
 * The store singleton is module-private. `docs/architecture/principles.md § D` says
 * components consume a store through typed hooks and selectors and never import the store
 * itself, so only the selector hooks and the actions below leave this module.
 */
const useSessionStore = create<SessionState>()(() => INITIAL_SESSION);

/**
 * The one writer. Everything the provider reports arrives here, and reporting a number is
 * what "signed in" means — `observeSession` collapses the Firebase user to its phone, so
 * an absent number is an absent session.
 *
 * The three fields are spelled out rather than spread because zustand merges shallowly:
 * an omitted `phoneNumber` would leave the previous user's number on screen after a
 * sign-out instead of clearing it.
 */
const applySession = (phoneNumber: string | undefined): void => {
  useSessionStore.setState({
    isInitialising: false,
    isSignedIn: phoneNumber !== undefined,
    phoneNumber,
  });
};

/** The narrowest slice there is — the flag the root navigator switches on. */
export const useIsSignedIn = (): boolean => useSessionStore(state => state.isSignedIn);

/** True while the provider has not yet reported. A consumer renders nothing until it clears. */
export const useIsSessionInitialising = (): boolean =>
  useSessionStore(state => state.isInitialising);

/** The signed-in number, for the settings screen to display. */
export const useSessionPhoneNumber = (): string | undefined =>
  useSessionStore(state => state.phoneNumber);

/**
 * Subscribes the store to the provider's auth state and returns the unsubscribe.
 *
 * The service is a parameter so a test can drive the store without a native module; the
 * default is the only implementation the app ever passes.
 */
export const startSessionObserver = (service: AuthService = firebaseAuthService): (() => void) =>
  service.observeSession(applySession);

/**
 * Subscribed at import time rather than from a provider component in `src/app/`.
 *
 * The session is a process-lifetime fact, not a React one: the listener has to be running
 * before the first render for a returning user to land on the tab shell, and nothing in
 * the app outlives the subscription, so there is no teardown to own. Tests that need a
 * controlled listener call `startSessionObserver` with their own service; this one is
 * inert there, because the provider module is mocked and never emits.
 */
startSessionObserver();

/**
 * Ends the session.
 *
 * The store is cleared first and the provider is told second: signing out is a local
 * operation, the user has already asked to leave, and making them watch a spinner while a
 * native call returns would be a worse answer than the optimistic one. The listener fires
 * straight after and re-asserts the same state, so the two cannot drift.
 *
 * It stays `(): void` because `signOut` is bound directly to a press handler.
 */
export const signOut = (): void => {
  applySession(undefined);
  void firebaseAuthService.signOut().catch((cause: unknown) => {
    // Nothing the user can act on: they are already signed out locally. Reported rather
    // than swallowed so a provider that refused to clear its own state is visible in the
    // log instead of surfacing later as a session that returns after a relaunch.
    console.warn('Firebase sign-out failed after the local session was cleared', cause);
  });
};

/**
 * TEMPORARY — seeds a session with no provider behind it.
 *
 * The placeholder verification screen from T-003 has no code field yet, so it needs some
 * way to say "assume a session exists"; this is that, and T-008 deletes it when the real
 * screen calls `confirmCode` instead. It sets `isSignedIn` without a number because it
 * genuinely has none, and Firebase holds no session, so a relaunch lands on the welcome
 * screen — a seeded session is visibly not a real one.
 */
export const signIn = (): void => {
  useSessionStore.setState({ isInitialising: false, isSignedIn: true, phoneNumber: undefined });
};
