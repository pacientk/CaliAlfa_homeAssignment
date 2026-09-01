/**
 * The global manual mock for the Firebase auth SDK.
 *
 * It exists because the published package ships untranspiled ES modules and reaches for a
 * native module that no Jest process has, so *importing* it is fatal — not calling it.
 * Every suite that touches `@features/auth`, including ones that only render the
 * navigator, would fail at import without this.
 *
 * It lives in the root `__mocks__/` per `docs/architecture/conventions.md § Test Code
 * Quality`, which is also what makes Jest apply it automatically to a `node_modules`
 * package with no `jest.mock` call in the suite.
 *
 * The defaults are inert: the auth listener never emits and nothing rejects, so a suite
 * that does not care about authentication sees a store that stays in its initial state.
 * A suite that does care sets an implementation on the function it exercises.
 */

/**
 * Stands in for the `Auth` instance.
 *
 * `settings` is real rather than inert: the service writes
 * `settings.appVerificationDisabledForTesting` before requesting a code, and a suite has to
 * be able to read back what it wrote. The flag is reset per test by the service suite.
 */
const AUTH_INSTANCE = {
  app: { name: '[DEFAULT]' },
  settings: { appVerificationDisabledForTesting: false },
};

const noop = (): void => {};

export const getAuth = jest.fn((): typeof AUTH_INSTANCE => AUTH_INSTANCE);

export const onAuthStateChanged = jest.fn(
  (_auth: unknown, _listener: (user: unknown) => void): (() => void) => noop,
);

export const signInWithPhoneNumber = jest.fn(
  (_auth: unknown, _e164Phone: string): Promise<unknown> => Promise.resolve(undefined),
);

export const signOut = jest.fn((_auth: unknown): Promise<void> => Promise.resolve());
