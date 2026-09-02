/**
 * Every way a call to the task API can fail, classified by what a caller should do
 * about it. This union is the input to the offline queue's drain policy, so its
 * boundaries are load-bearing: a failure classified as retryable is replayed, a
 * terminal one is discarded.
 */
export type ApiFailure =
  /**
   * DNS, socket, timeout, or an unreadable response body — and a lost connection, which is
   * indistinguishable from the rest at this layer. There is deliberately no separate `offline`
   * kind: nothing can construct one. `fetch` rejects the same way whether the interface is down
   * or the host is unreachable, and the connectivity service is a consumer of these failures
   * rather than a producer of them, so a kind only it could raise would be a kind nobody raises.
   */
  | { kind: 'transport'; cause: unknown }
  /** 5xx, plus 408 and 429 — the server asked us, explicitly or implicitly, to come back. */
  | { kind: 'server'; status: number }
  /** 404 — the record is gone. A queued update or delete against it is pointless. */
  | { kind: 'notFound' }
  /** Any other 4xx. The request itself is wrong; replaying it changes nothing. */
  | { kind: 'client'; status: number };

const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 299;
const HTTP_NOT_FOUND = 404;
const HTTP_REQUEST_TIMEOUT = 408;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_SERVER_ERROR_MIN = 500;

const RETRYABLE_KINDS: ReadonlySet<ApiFailure['kind']> = new Set<ApiFailure['kind']>([
  'transport',
  'server',
]);

/**
 * Maps an HTTP status onto a failure, or `undefined` when the status is a success.
 *
 * A non-2xx status below 400 is only reachable when redirects are not followed, which
 * this client never does; it is classified as `client` because replaying it would
 * produce the same redirect again.
 */
export const classifyHttpStatus = (status: number): ApiFailure | undefined => {
  if (status >= HTTP_OK_MIN && status <= HTTP_OK_MAX) {
    return undefined;
  }
  if (status === HTTP_NOT_FOUND) {
    return { kind: 'notFound' };
  }
  if (status === HTTP_REQUEST_TIMEOUT || status === HTTP_TOO_MANY_REQUESTS) {
    return { kind: 'server', status };
  }
  if (status >= HTTP_SERVER_ERROR_MIN) {
    return { kind: 'server', status };
  }
  return { kind: 'client', status };
};

/** True when replaying the request later could plausibly succeed. */
export const isRetryableFailure = (failure: ApiFailure): boolean =>
  RETRYABLE_KINDS.has(failure.kind);
