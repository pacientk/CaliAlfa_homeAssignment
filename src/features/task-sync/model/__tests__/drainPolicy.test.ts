import type { ApiFailure } from '@shared/api';

import {
  backoffDelayMs,
  classifyDrainFailure,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
} from '../drainPolicy';

const TRANSPORT: ApiFailure = { kind: 'transport', cause: new Error('socket closed') };

describe('backoffDelayMs', () => {
  it('waits the base delay after the first failed attempt', () => {
    expect(backoffDelayMs(1)).toBe(RETRY_BASE_DELAY_MS);
  });

  it('doubles with each further attempt', () => {
    expect(backoffDelayMs(2)).toBe(RETRY_BASE_DELAY_MS * 2);
    expect(backoffDelayMs(3)).toBe(RETRY_BASE_DELAY_MS * 4);
    expect(backoffDelayMs(4)).toBe(RETRY_BASE_DELAY_MS * 8);
  });

  it('stops growing at the ceiling, so a long outage does not schedule a retry next year', () => {
    expect(backoffDelayMs(20)).toBe(RETRY_MAX_DELAY_MS);
    expect(backoffDelayMs(1000)).toBe(RETRY_MAX_DELAY_MS);
  });

  it('never returns less than the base delay, even for a nonsensical attempt count', () => {
    expect(backoffDelayMs(0)).toBe(RETRY_BASE_DELAY_MS);
    expect(backoffDelayMs(-5)).toBe(RETRY_BASE_DELAY_MS);
  });
});

describe('classifyDrainFailure — retry, drop the record, or give up', () => {
  it('retries a transport failure', () => {
    expect(classifyDrainFailure(TRANSPORT, 'create')).toBe('retry');
  });

  it('retries a 5xx', () => {
    expect(classifyDrainFailure({ kind: 'server', status: 503 }, 'update')).toBe('retry');
  });

  it('does not retry a 4xx — replaying a malformed request changes nothing', () => {
    expect(classifyDrainFailure({ kind: 'client', status: 400 }, 'update')).toBe('terminal');
  });

  it('treats a 404 on an update as a record that is gone, not as an error to surface', () => {
    expect(classifyDrainFailure({ kind: 'notFound' }, 'update')).toBe('discardMissing');
  });

  it('treats a 404 on a delete the same way — the record is already gone', () => {
    expect(classifyDrainFailure({ kind: 'notFound' }, 'delete')).toBe('discardMissing');
  });

  it('treats a 404 on a create as terminal, because the collection cannot be missing', () => {
    expect(classifyDrainFailure({ kind: 'notFound' }, 'create')).toBe('terminal');
  });
});
