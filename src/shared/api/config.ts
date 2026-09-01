/**
 * Base URL of the mockapi.io resource that backs this app. Unauthenticated and
 * read-only from the app's point of view, so it is not a secret and is checked in.
 */
export const API_BASE_URL = 'https://67c98b60102d684575c282fe.mockapi.io/api/v1';

/**
 * A request that has not produced a response by this point is aborted. The abort
 * surfaces as a `transport` failure, which the queue treats as retryable.
 */
export const REQUEST_TIMEOUT_MS = 10_000;
