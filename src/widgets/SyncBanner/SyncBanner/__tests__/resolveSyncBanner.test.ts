import { strings } from '@lib/strings';

import { resolveSyncBanner } from '../resolveSyncBanner';

describe('resolveSyncBanner', () => {
  it('says nothing at all when the app is online, idle, and has not failed', () => {
    expect(resolveSyncBanner(true, 0, undefined)).toBeUndefined();
  });

  it('announces the outage when the device is offline', () => {
    expect(resolveSyncBanner(false, 0, undefined)).toEqual({
      tone: 'offline',
      icon: 'cloud_off',
      color: 'secondary',
      message: strings.syncBanner.offline,
    });
  });

  it('counts the queued changes while they are still draining', () => {
    expect(resolveSyncBanner(true, 2, undefined)?.message).toBe(strings.syncBanner.pending(2));
    expect(resolveSyncBanner(true, 1, undefined)?.message).toBe('Syncing 1 change…');
  });

  it('picks its wording from the failure kind rather than from a stored message', () => {
    expect(resolveSyncBanner(true, 0, 'server')?.message).toBe(strings.syncBanner.error.server);
    expect(resolveSyncBanner(true, 0, 'notFound')?.message).toBe(strings.syncBanner.error.notFound);
    expect(resolveSyncBanner(true, 0, 'client')?.message).toBe(strings.syncBanner.error.client);
    expect(resolveSyncBanner(true, 0, 'transport')?.message).toBe(
      strings.syncBanner.error.transport,
    );
  });

  it('reports being offline ahead of anything the outage caused', () => {
    expect(resolveSyncBanner(false, 3, 'transport')?.tone).toBe('offline');
  });

  it('reports a failure ahead of the queue that is still waiting behind it', () => {
    expect(resolveSyncBanner(true, 3, 'server')?.tone).toBe('error');
  });
});
