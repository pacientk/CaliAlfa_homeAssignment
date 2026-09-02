import type { ApiFailure } from '@shared/api';

import { createOutcomeConnectivity } from '../outcomeConnectivity';
import type { ScheduleTimer } from '../ScheduleTimer';

const PROBE_DELAY_MS = 5_000;

interface ScheduledTimer {
  delayMs: number;
  run: () => void;
}

const createTimerLog = (): { timers: ScheduledTimer[]; scheduleTimer: ScheduleTimer } => {
  const timers: ScheduledTimer[] = [];
  return {
    timers,
    scheduleTimer: (delayMs, run) => {
      timers.push({ delayMs, run });
    },
  };
};

const fireOldest = (timers: ScheduledTimer[]): void => {
  const timer = timers.shift();
  if (timer === undefined) {
    throw new Error('expected a scheduled timer');
  }
  timer.run();
};

const setup = () => {
  const { timers, scheduleTimer } = createTimerLog();
  const connectivity = createOutcomeConnectivity({ scheduleTimer, probeDelayMs: PROBE_DELAY_MS });
  return { timers, connectivity };
};

const TRANSPORT_FAILURE: ApiFailure = { kind: 'transport', cause: new Error('socket closed') };

describe('createOutcomeConnectivity — deriving connectivity from request outcomes', () => {
  it('starts online, because refusing to try would never produce the evidence', () => {
    expect(setup().connectivity.getIsOnline()).toBe(true);
  });

  it('goes offline after a transport failure', () => {
    const { connectivity } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(connectivity.getIsOnline()).toBe(false);
  });

  it('goes offline after an explicit offline failure', () => {
    const { connectivity } = setup();
    connectivity.reportFailure({ kind: 'offline' });
    expect(connectivity.getIsOnline()).toBe(false);
  });

  it('stays online after a 5xx — reaching the server is proof of connectivity', () => {
    const { connectivity } = setup();
    connectivity.reportFailure({ kind: 'server', status: 503 });
    expect(connectivity.getIsOnline()).toBe(true);
  });

  it('stays online after a 4xx', () => {
    const { connectivity } = setup();
    connectivity.reportFailure({ kind: 'client', status: 400 });
    expect(connectivity.getIsOnline()).toBe(true);
  });

  it('stays online after a notFound', () => {
    const { connectivity } = setup();
    connectivity.reportFailure({ kind: 'notFound' });
    expect(connectivity.getIsOnline()).toBe(true);
  });

  it('comes back online when a server-reaching failure follows a transport one', () => {
    const { connectivity } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    connectivity.reportFailure({ kind: 'server', status: 500 });
    expect(connectivity.getIsOnline()).toBe(true);
  });

  it('comes back online on a success', () => {
    const { connectivity } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    connectivity.reportSuccess();
    expect(connectivity.getIsOnline()).toBe(true);
  });

  it('schedules a probe at the configured delay when it goes offline', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(timers).toHaveLength(1);
    expect(timers[0]?.delayMs).toBe(PROBE_DELAY_MS);
  });

  it('permits one attempt once the probe fires, which is how a recovery is ever noticed', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(connectivity.getShouldAttempt()).toBe(false);

    fireOldest(timers);

    expect(connectivity.getShouldAttempt()).toBe(true);
  });

  it('does not claim to be online when the probe fires — nothing has happened to justify it', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    fireOldest(timers);
    expect(connectivity.getIsOnline()).toBe(false);
  });

  it('stays offline when the attempt the probe bought fails as well', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    fireOldest(timers);
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(connectivity.getIsOnline()).toBe(false);
  });

  it('never reports online across a whole outage, however many probes come and go', () => {
    const { connectivity, timers } = setup();
    const reported: boolean[] = [];
    connectivity.subscribe(() => {
      reported.push(connectivity.getIsOnline());
    });

    connectivity.reportFailure(TRANSPORT_FAILURE);
    for (let cycle = 0; cycle < 4; cycle += 1) {
      fireOldest(timers);
      connectivity.reportFailure(TRANSPORT_FAILURE);
    }

    // The banner reads this value. If a probe moved it, the banner would flash green and back
    // to red on every cycle for as long as the device had no network.
    expect(reported).not.toContain(true);
  });

  it('stays offline when nothing retries at all, rather than forgetting after the delay', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);

    // Nobody drains, because there is nothing queued. The probe comes due and goes unanswered.
    fireOldest(timers);

    expect(connectivity.getIsOnline()).toBe(false);
  });

  it('goes back online once the attempt the probe bought succeeds', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    fireOldest(timers);
    connectivity.reportSuccess();
    expect(connectivity.getIsOnline()).toBe(true);
    expect(connectivity.getShouldAttempt()).toBe(true);
  });

  it('wakes its subscribers when the probe comes due, so something makes the attempt', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    const listener = jest.fn();
    connectivity.subscribe(listener);

    fireOldest(timers);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('schedules only one probe no matter how many failures arrive', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    connectivity.reportFailure(TRANSPORT_FAILURE);
    connectivity.reportFailure({ kind: 'offline' });
    expect(timers).toHaveLength(1);
  });

  it('schedules a fresh probe after the previous one has fired', () => {
    const { connectivity, timers } = setup();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    fireOldest(timers);
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(timers).toHaveLength(1);
  });

  it('schedules no probe at all while every request keeps succeeding', () => {
    const { connectivity, timers } = setup();
    connectivity.reportSuccess();
    connectivity.reportFailure({ kind: 'server', status: 500 });
    expect(timers).toHaveLength(0);
  });

  it('notifies subscribers on a transition', () => {
    const { connectivity } = setup();
    const listener = jest.fn();
    connectivity.subscribe(listener);
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify when the state is unchanged', () => {
    const { connectivity } = setup();
    const listener = jest.fn();
    connectivity.subscribe(listener);
    connectivity.reportSuccess();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying an unsubscribed listener', () => {
    const { connectivity } = setup();
    const listener = jest.fn();
    const unsubscribe = connectivity.subscribe(listener);
    unsubscribe();
    connectivity.reportFailure(TRANSPORT_FAILURE);
    expect(listener).not.toHaveBeenCalled();
  });
});
