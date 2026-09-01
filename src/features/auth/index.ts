/**
 * The authentication feature's public surface.
 *
 * Today it is a session stub: a flag defaulting to signed-out, so the root navigator has
 * something real to switch on before Firebase exists. T-007 replaces `model/sessionStore.ts`
 * with the Firebase-backed store and keeps this barrel's shape, so the navigator and the
 * screens that consume it do not change.
 *
 * It lives here rather than in `shared/store/` because that directory belongs to T-006.
 */
export { signIn, signOut, useIsSignedIn } from './model/sessionStore';
