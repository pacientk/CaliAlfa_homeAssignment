import { createContext, useContext } from 'react';

import type { AuthService } from './AuthService';
import { firebaseAuthService } from './firebaseAuthService';

/**
 * How a screen reaches the identity provider.
 *
 * The default value is the real service, so nothing in `src/app/` has to mount a provider for
 * the app to work — the seam exists for the tests, which wrap a screen in this context to run
 * the whole sign-in flow against `testing/authServiceDouble` instead of a native module.
 *
 * A context rather than a screen prop on purpose. `docs/architecture/principles.md § D` wants
 * the dependency inverted, and threading a service through the navigator would put a piece of
 * infrastructure into the props of every screen that touches it.
 */
export const AuthServiceContext = createContext<AuthService>(firebaseAuthService);

/** The provider the surrounding tree supplies, or the Firebase one when nothing overrides it. */
export const useAuthService = (): AuthService => useContext(AuthServiceContext);
