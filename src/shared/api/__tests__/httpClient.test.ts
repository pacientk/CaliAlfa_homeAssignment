import { ApiError, isApiError } from '../ApiError';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config';
import { requestJson } from '../httpClient';

/**
 * A minimal stand-in for `Response`. The client only reads `status` and `json()`, and
 * constructing a real `Response` would tie these tests to whichever fetch polyfill the
 * environment happens to provide.
 */
const stubResponse = (status: number, json: () => Promise<unknown>): Response =>
  ({ status, json }) as unknown as Response;

const jsonResponse = (status: number, body: unknown): Response =>
  stubResponse(status, () => Promise.resolve(body));

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();

beforeEach(() => {
  fetchMock.mockReset();
  // Replacing a global is the one thing a fetch-level test cannot do without a cast.
  (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;
});

const lastCall = (): [string, RequestInit] => {
  const call = fetchMock.mock.calls[0];
  if (call === undefined) {
    throw new Error('fetch was never called');
  }
  return call;
};

const failureOf = async (promise: Promise<unknown>): Promise<ApiError['failure']> => {
  try {
    await promise;
  } catch (error) {
    if (isApiError(error)) {
      return error.failure;
    }
    throw error;
  }
  throw new Error('expected the request to reject');
};

describe('requestJson — the happy path', () => {
  it('returns the parsed body and builds the URL from the base URL and path', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: '1' }));

    await expect(requestJson({ method: 'GET', path: '/tasks/1' })).resolves.toEqual({ id: '1' });

    const [url, init] = lastCall();
    expect(url).toBe(`${API_BASE_URL}/tasks/1`);
    expect(init.method).toBe('GET');
  });

  it('appends and percent-encodes query parameters', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, []));

    await requestJson({ method: 'GET', path: '/tasks', query: { p: '2', l: '20', q: 'a b&c' } });

    expect(lastCall()[0]).toBe(`${API_BASE_URL}/tasks?p=2&l=20&q=a%20b%26c`);
  });

  it('sends no body and no content type when the request has no body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await requestJson({ method: 'DELETE', path: '/tasks/1' });

    const [, init] = lastCall();
    expect(init.body).toBeUndefined();
    expect(init.headers).toBeUndefined();
  });

  it('serialises the body as JSON and declares the content type', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}));

    await requestJson({ method: 'POST', path: '/tasks', body: { title: 'Write the spec' } });

    const [, init] = lastCall();
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init.body).toBe('{"title":"Write the spec"}');
  });
});

describe('requestJson — HTTP status classification', () => {
  it.each([
    [500, { kind: 'server', status: 500 }],
    [503, { kind: 'server', status: 503 }],
    [429, { kind: 'server', status: 429 }],
    [404, { kind: 'notFound' }],
    [422, { kind: 'client', status: 422 }],
    [401, { kind: 'client', status: 401 }],
  ])('turns %i into %o', async (status, failure) => {
    fetchMock.mockResolvedValue(jsonResponse(status, { message: 'nope' }));

    await expect(failureOf(requestJson({ method: 'GET', path: '/tasks' }))).resolves.toEqual(
      failure,
    );
  });

  it('does not read the body of a failing response', async () => {
    const json = jest.fn<Promise<unknown>, []>();
    fetchMock.mockResolvedValue(stubResponse(500, json));

    await failureOf(requestJson({ method: 'GET', path: '/tasks' }));

    expect(json).not.toHaveBeenCalled();
  });
});

describe('requestJson — transport failures', () => {
  it('turns a rejected fetch into a transport failure carrying the cause', async () => {
    const cause = new TypeError('Network request failed');
    fetchMock.mockRejectedValue(cause);

    await expect(failureOf(requestJson({ method: 'GET', path: '/tasks' }))).resolves.toEqual({
      kind: 'transport',
      cause,
    });
  });

  it('turns an unreadable body into a transport failure', async () => {
    const cause = new SyntaxError('Unexpected token < in JSON');
    fetchMock.mockResolvedValue(stubResponse(200, () => Promise.reject(cause)));

    await expect(failureOf(requestJson({ method: 'GET', path: '/tasks' }))).resolves.toEqual({
      kind: 'transport',
      cause,
    });
  });

  it('never rejects with a raw error — every rejection is an ApiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(requestJson({ method: 'GET', path: '/tasks' })).rejects.toBeInstanceOf(ApiError);
  });
});

describe('requestJson — the timeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('aborts a request that outlives the timeout and reports it as transport', async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            reject(new Error('Aborted'));
          });
        }),
    );

    const pending = failureOf(requestJson({ method: 'GET', path: '/tasks' }));
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS);

    await expect(pending).resolves.toEqual({
      kind: 'transport',
      cause: new Error('Aborted'),
    });
  });

  it('clears the timeout once the response has arrived', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await requestJson({ method: 'GET', path: '/tasks' });

    expect(jest.getTimerCount()).toBe(0);
  });
});
