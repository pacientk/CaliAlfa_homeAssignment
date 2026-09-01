import { ApiError } from './ApiError';
import { classifyHttpStatus } from './ApiFailure';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HttpRequest {
  method: HttpMethod;
  /** Path below the base URL, leading slash included. */
  path: string;
  /** Query parameters, appended in insertion order and percent-encoded. */
  query?: Record<string, string>;
  /** Serialised as JSON. Omitted entirely when absent, headers included. */
  body?: unknown;
}

const buildQuery = (query: Record<string, string>): string =>
  Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

const buildUrl = (path: string, query?: Record<string, string>): string => {
  const search = query === undefined ? '' : buildQuery(query);
  return search === '' ? `${API_BASE_URL}${path}` : `${API_BASE_URL}${path}?${search}`;
};

const buildInit = (request: HttpRequest, signal: AbortSignal): RequestInit => {
  if (request.body === undefined) {
    return { method: request.method, signal };
  }
  return {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request.body),
    signal,
  };
};

const sendRequest = async (request: HttpRequest): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    return await fetch(
      buildUrl(request.path, request.query),
      buildInit(request, controller.signal),
    );
  } catch (cause) {
    // A rejected fetch is indistinguishable from a lost connection at this layer.
    // The connectivity service upgrades this to `offline` where it can tell.
    throw new ApiError({ kind: 'transport', cause });
  } finally {
    clearTimeout(timeoutId);
  }
};

const readJson = async (response: Response): Promise<unknown> => {
  try {
    // `Response.json()` is declared as `any`; widening to `unknown` is what forces
    // every caller through a validating parser instead of trusting the wire.
    return (await response.json()) as unknown;
  } catch (cause) {
    throw new ApiError({ kind: 'transport', cause });
  }
};

/**
 * Performs one JSON request against the task API.
 *
 * Resolves with the parsed body as `unknown` — validation belongs to the caller that
 * knows the expected shape. Rejects with an {@link ApiError} carrying a classified
 * failure; it never rejects with anything else.
 */
export const requestJson = async (request: HttpRequest): Promise<unknown> => {
  const response = await sendRequest(request);
  const failure = classifyHttpStatus(response.status);
  if (failure !== undefined) {
    throw new ApiError(failure);
  }
  return readJson(response);
};
