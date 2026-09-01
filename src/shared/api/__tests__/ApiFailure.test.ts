import type { ApiFailure } from '../ApiFailure';
import { classifyHttpStatus, isRetryableFailure } from '../ApiFailure';

describe('classifyHttpStatus', () => {
  it('reports no failure for a success status', () => {
    expect(classifyHttpStatus(200)).toBeUndefined();
    expect(classifyHttpStatus(201)).toBeUndefined();
    expect(classifyHttpStatus(204)).toBeUndefined();
    expect(classifyHttpStatus(299)).toBeUndefined();
  });

  it('classifies 5xx as a retryable server failure carrying the status', () => {
    expect(classifyHttpStatus(500)).toEqual({ kind: 'server', status: 500 });
    expect(classifyHttpStatus(503)).toEqual({ kind: 'server', status: 503 });
  });

  it('classifies 408 and 429 as server failures rather than client ones', () => {
    expect(classifyHttpStatus(408)).toEqual({ kind: 'server', status: 408 });
    expect(classifyHttpStatus(429)).toEqual({ kind: 'server', status: 429 });
  });

  it('classifies 404 as notFound, without a status', () => {
    expect(classifyHttpStatus(404)).toEqual({ kind: 'notFound' });
  });

  it('classifies any other 4xx as a terminal client failure', () => {
    expect(classifyHttpStatus(400)).toEqual({ kind: 'client', status: 400 });
    expect(classifyHttpStatus(401)).toEqual({ kind: 'client', status: 401 });
    expect(classifyHttpStatus(422)).toEqual({ kind: 'client', status: 422 });
  });
});

describe('isRetryableFailure', () => {
  const retryable: ApiFailure[] = [
    { kind: 'offline' },
    { kind: 'transport', cause: new Error('socket closed') },
    { kind: 'server', status: 500 },
  ];

  const terminal: ApiFailure[] = [{ kind: 'notFound' }, { kind: 'client', status: 422 }];

  it.each(retryable)('treats $kind as retryable', failure => {
    expect(isRetryableFailure(failure)).toBe(true);
  });

  it.each(terminal)('treats $kind as terminal', failure => {
    expect(isRetryableFailure(failure)).toBe(false);
  });
});
