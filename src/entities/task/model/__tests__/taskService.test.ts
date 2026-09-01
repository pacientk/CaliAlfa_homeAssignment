import type { ApiError } from '@shared/api';
import { isApiError } from '@shared/api';

import type { Task, TaskDraft } from '../Task';
import { createTask, deleteTask, fetchTask, fetchTaskPage, updateTask } from '../taskService';

/** Only `status` and `json()` are read by the client — see httpClient.test.ts. */
const jsonResponse = (status: number, body: unknown): Response =>
  ({ status, json: () => Promise.resolve(body) }) as unknown as Response;

const wireRecord = {
  id: '7',
  title: 'Ship the spec',
  description: 'Write it before the code',
  category: 'Work',
  is_done: false,
  createdAt: '2026-09-01T08:30:00.000Z',
};

const domainRecord: Task = {
  id: '7',
  title: 'Ship the spec',
  description: 'Write it before the code',
  category: 'Work',
  isDone: false,
  createdAt: '2026-09-01T08:30:00.000Z',
};

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

/** Reads the request body back off the mock boundary as the API would receive it. */
const sentBody = (): unknown => {
  const [, init] = lastCall();
  if (typeof init.body !== 'string') {
    throw new Error('expected a JSON string body');
  }
  return JSON.parse(init.body) as unknown;
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

describe('fetchTaskPage', () => {
  it('requests the asked-for page and limit and returns mapped tasks', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [wireRecord]));

    await expect(fetchTaskPage(2, 20)).resolves.toEqual([domainRecord]);

    const [url, init] = lastCall();
    expect(url).toContain('/tasks?p=2&l=20');
    expect(init.method).toBe('GET');
  });

  it('maps an empty page to an empty list', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, []));

    await expect(fetchTaskPage(1, 20)).resolves.toEqual([]);
  });

  it('maps a page past the end of the collection to an empty list', async () => {
    // Probed against the live service on 2026-09-01: a page beyond the last record
    // answers 200 with [], not 404, so the first sync can terminate on a short page.
    fetchMock.mockResolvedValue(jsonResponse(200, []));

    await expect(fetchTaskPage(3, 1)).resolves.toEqual([]);
    expect(lastCall()[0]).toContain('/tasks?p=3&l=1');
  });

  it('maps a short page — fewer records than the limit — without padding it', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [wireRecord]));

    await expect(fetchTaskPage(1, 20)).resolves.toHaveLength(1);
  });

  it('rejects a body that is not a list', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { message: 'Not found' }));

    await expect(failureOf(fetchTaskPage(1, 20))).resolves.toMatchObject({ kind: 'transport' });
  });

  it('rejects the whole page when one record is malformed', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, [wireRecord, { ...wireRecord, id: '8', is_done: 'yes' }]),
    );

    await expect(failureOf(fetchTaskPage(1, 20))).resolves.toMatchObject({ kind: 'transport' });
  });
});

describe('fetchTask', () => {
  it('requests the record by id and maps it', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, wireRecord));

    await expect(fetchTask('7')).resolves.toEqual(domainRecord);
    expect(lastCall()[0]).toContain('/tasks/7');
  });

  it('percent-encodes an id that is not URL-safe', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, wireRecord));

    await fetchTask('a/b?c');

    expect(lastCall()[0]).toContain('/tasks/a%2Fb%3Fc');
  });

  it('reports a missing record as notFound, which the queue treats as terminal', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { message: 'Not found' }));

    await expect(failureOf(fetchTask('7'))).resolves.toEqual({ kind: 'notFound' });
  });
});

describe('createTask', () => {
  const draft: TaskDraft = {
    title: 'Ship the spec',
    description: 'Write it before the code',
    category: 'Work',
    isDone: false,
    createdAt: '2026-09-01T08:30:00.000Z',
    expiresAt: null,
  };

  it('POSTs the draft with createdAt verbatim and is_done in wire spelling', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, wireRecord));

    await createTask(draft);

    const [url, init] = lastCall();
    expect(url).toContain('/tasks');
    expect(init.method).toBe('POST');
    expect(sentBody()).toEqual({
      title: 'Ship the spec',
      description: 'Write it before the code',
      category: 'Work',
      is_done: false,
      createdAt: '2026-09-01T08:30:00.000Z',
      expiresAt: null,
    });
  });

  it('always carries a createdAt, whatever else the draft holds', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, wireRecord));

    await createTask({ ...draft, createdAt: '2020-01-01T00:00:00.000Z' });

    expect(sentBody()).toMatchObject({ createdAt: '2020-01-01T00:00:00.000Z' });
  });

  it('sends the date when the draft has an expiry', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, wireRecord));

    await createTask({ ...draft, expiresAt: '2026-09-08T00:00:00.000Z' });

    expect(sentBody()).toMatchObject({ expiresAt: '2026-09-08T00:00:00.000Z' });
  });

  it('sends an explicit null when the draft has no expiry', async () => {
    // Omitting the key makes the service invent a random expiry about a year out,
    // which would later render the task as expired. Probed on 2026-09-01.
    fetchMock.mockResolvedValue(jsonResponse(201, wireRecord));

    await createTask(draft);

    expect(Object.keys(sentBody() as object)).toContain('expiresAt');
    expect(sentBody()).toMatchObject({ expiresAt: null });
  });

  it('maps a stored null expiry back to a Task with no expiresAt key', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { ...wireRecord, expiresAt: null }));

    const created = await createTask(draft);

    expect('expiresAt' in created).toBe(false);
  });

  it('reports a rejected create as a terminal client failure', async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { message: 'invalid' }));

    await expect(failureOf(createTask(draft))).resolves.toEqual({ kind: 'client', status: 422 });
  });
});

describe('updateTask', () => {
  it('PUTs only the changed fields, because the service merges', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ...wireRecord, is_done: true }));

    await expect(updateTask('7', { isDone: true })).resolves.toEqual({
      ...domainRecord,
      isDone: true,
    });

    const [url, init] = lastCall();
    expect(url).toContain('/tasks/7');
    expect(init.method).toBe('PUT');
    expect(sentBody()).toEqual({ is_done: true });
  });

  it('sets an expiry by sending the date', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { ...wireRecord, expiresAt: '2026-09-08T00:00:00.000Z' }),
    );

    const updated = await updateTask('7', { expiresAt: '2026-09-08T00:00:00.000Z' });

    expect(sentBody()).toEqual({ expiresAt: '2026-09-08T00:00:00.000Z' });
    expect(updated.expiresAt).toBe('2026-09-08T00:00:00.000Z');
  });

  it('clears an expiry by sending an explicit null', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ...wireRecord, expiresAt: null }));

    const updated = await updateTask('7', { expiresAt: null });

    expect(sentBody()).toEqual({ expiresAt: null });
    expect('expiresAt' in updated).toBe(false);
  });

  it('leaves a stored expiry alone by not sending the key at all', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { ...wireRecord, expiresAt: '2026-09-08T00:00:00.000Z' }),
    );

    const updated = await updateTask('7', { title: 'Renamed' });

    expect(sentBody()).toEqual({ title: 'Renamed' });
    expect(Object.keys(sentBody() as object)).not.toContain('expiresAt');
    expect(updated.expiresAt).toBe('2026-09-08T00:00:00.000Z');
  });

  it('reports a missing record as notFound so the queue can drop the entry', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { message: 'Not found' }));

    await expect(failureOf(updateTask('7', { title: 'Renamed' }))).resolves.toEqual({
      kind: 'notFound',
    });
  });

  it('reports a 500 as a retryable server failure', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, { message: 'boom' }));

    await expect(failureOf(updateTask('7', { title: 'Renamed' }))).resolves.toEqual({
      kind: 'server',
      status: 500,
    });
  });
});

describe('deleteTask', () => {
  it('DELETEs by id and returns the removed record', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, wireRecord));

    await expect(deleteTask('7')).resolves.toEqual(domainRecord);

    const [url, init] = lastCall();
    expect(url).toContain('/tasks/7');
    expect(init.method).toBe('DELETE');
    expect(init.body).toBeUndefined();
  });

  it('reports an already-deleted record as notFound', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { message: 'Not found' }));

    await expect(failureOf(deleteTask('7'))).resolves.toEqual({ kind: 'notFound' });
  });
});

describe('the service never reaches the live API', () => {
  it('makes every call through the injected fetch stub', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, wireRecord));

    await fetchTask('7');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
