import { create } from 'zustand';

/**
 * Whether a session exists. Nothing more: the real store — the Firebase user, the
 * verification id, the sign-in errors — arrives with T-007, which replaces this file.
 */
interface SessionState {
  readonly isSignedIn: boolean;
}

const INITIAL_SESSION: SessionState = { isSignedIn: false };

/**
 * The store singleton is module-private on purpose. `docs/architecture/principles.md § D`
 * says components consume a store through typed hooks and selectors and never import the
 * store itself, so the only things that leave this module are the selector hook below and
 * the two actions.
 */
const useSessionStore = create<SessionState>()(() => INITIAL_SESSION);

/** The narrowest slice there is — the flag the root navigator switches on. */
export const useIsSignedIn = (): boolean => useSessionStore(state => state.isSignedIn);

/**
 * Actions are plain functions rather than members of the state object. They are called from
 * event handlers and from tests, never rendered, so binding them to a hook would buy nothing
 * and would stop a test from arranging state without a component.
 */
export const signIn = (): void => {
  useSessionStore.setState({ isSignedIn: true });
};

export const signOut = (): void => {
  useSessionStore.setState({ isSignedIn: false });
};
