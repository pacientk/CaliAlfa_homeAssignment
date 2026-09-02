import type { Task, TaskChanges, TaskDraft } from '@entities/task/model';
import type { ApiFailure } from '@shared/api';
import type {
  CancelTimer,
  ConnectivityService,
  ScheduleTimer,
} from '@shared/services/connectivity';

import type { MutationKind } from '../model/QueuedMutation';
import type { TaskPageSource } from '../model/TaskPageSource';
import type { TaskTransport } from '../model/TaskTransport';
import { serverTaskOf } from './taskSyncFixtures';

/**
 * The doubles the data layer is exercised against. They live beside the interfaces they
 * implement, for the reason `createMemoryStorage` gives: a double in the same tree as its
 * interface is the one that gets updated when the interface changes.
 */

export interface FakeConnectivity extends ConnectivityService {
  setIsOnline(isNextOnline: boolean): void;
  /** Grants the one attempt a probe buys, without claiming the network is back. */
  setProbeDue(isNextProbeDue: boolean): void;
  readonly reportedFailures: ApiFailure[];
  readonly successCount: () => number;
}

export const createFakeConnectivity = (isInitiallyOnline = true): FakeConnectivity => {
  let isOnline = isInitiallyOnline;
  let isProbeDue = false;
  let successes = 0;
  const listeners = new Set<() => void>();
  const reportedFailures: ApiFailure[] = [];

  return {
    reportedFailures,
    successCount: (): number => successes,
    getIsOnline: (): boolean => isOnline,
    getShouldAttempt: (): boolean => isOnline || isProbeDue,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reportSuccess: (): void => {
      successes += 1;
    },
    reportFailure: (failure: ApiFailure): void => {
      reportedFailures.push(failure);
    },
    setIsOnline: (isNextOnline: boolean): void => {
      if (isOnline === isNextOnline) {
        return;
      }
      isOnline = isNextOnline;
      isProbeDue = false;
      for (const listener of listeners) {
        listener();
      }
    },
    setProbeDue: (isNextProbeDue: boolean): void => {
      if (isProbeDue === isNextProbeDue) {
        return;
      }
      isProbeDue = isNextProbeDue;
      for (const listener of listeners) {
        listener();
      }
    },
  };
};

/** One request as the server would have received it. */
export interface TransportCall {
  kind: MutationKind;
  taskId?: string;
  draft?: TaskDraft;
  changes?: TaskChanges;
}

/** `isPending` never settles, which is how a test observes the state before the network. */
export type TransportOutcome = { task: Task } | { error: Error } | { isPending: true };

export interface FakeTransport extends TaskTransport {
  readonly calls: TransportCall[];
  script(kind: MutationKind, ...outcomes: TransportOutcome[]): void;
}

export const createFakeTransport = (): FakeTransport => {
  const calls: TransportCall[] = [];
  const scripted = new Map<MutationKind, TransportOutcome[]>([
    ['create', []],
    ['update', []],
    ['delete', []],
  ]);

  const settle = (kind: MutationKind, fallback: Task): Promise<Task> => {
    const outcome = scripted.get(kind)?.shift() ?? { task: fallback };
    if ('error' in outcome) {
      return Promise.reject(outcome.error);
    }
    if ('isPending' in outcome) {
      return new Promise<Task>(() => undefined);
    }
    return Promise.resolve(outcome.task);
  };

  return {
    calls,
    script: (kind: MutationKind, ...outcomes: TransportOutcome[]): void => {
      scripted.get(kind)?.push(...outcomes);
    },
    createTask: (draft: TaskDraft): Promise<Task> => {
      calls.push({ kind: 'create', draft });
      return settle('create', serverTaskOf(`server-${calls.length}`, { title: draft.title }));
    },
    updateTask: (id: string, changes: TaskChanges): Promise<Task> => {
      calls.push({ kind: 'update', taskId: id, changes });
      return settle('update', serverTaskOf(id));
    },
    deleteTask: (id: string): Promise<Task> => {
      calls.push({ kind: 'delete', taskId: id });
      return settle('delete', serverTaskOf(id));
    },
  };
};

export interface PageRequest {
  page: number;
  limit: number;
}

export type PageOutcome = Task[] | Error;

export interface FakePageSource extends TaskPageSource {
  readonly calls: PageRequest[];
  script(...outcomes: PageOutcome[]): void;
}

/** Unscripted, it answers with an empty page — a collection the server has nothing in. */
export const createFakePageSource = (): FakePageSource => {
  const calls: PageRequest[] = [];
  const scripted: PageOutcome[] = [];

  return {
    calls,
    script: (...outcomes: PageOutcome[]): void => {
      scripted.push(...outcomes);
    },
    fetchTaskPage: (page: number, limit: number): Promise<Task[]> => {
      calls.push({ page, limit });
      const outcome = scripted.shift() ?? [];
      if (outcome instanceof Error) {
        return Promise.reject(outcome);
      }
      return Promise.resolve(outcome);
    },
  };
};

export interface ScheduledTimer {
  delayMs: number;
  run: () => void;
  /** Set when whoever scheduled it called it off. The timer stays in the list either way. */
  isCancelled: boolean;
}

export interface TimerRecorder {
  readonly timers: ScheduledTimer[];
  scheduleTimer: ScheduleTimer;
}

/** Records the delay a policy asked for instead of advancing a clock and hoping. */
export const createTimerRecorder = (): TimerRecorder => {
  const timers: ScheduledTimer[] = [];
  return {
    timers,
    scheduleTimer: (delayMs: number, run: () => void): CancelTimer => {
      const timer: ScheduledTimer = { delayMs, run, isCancelled: false };
      timers.push(timer);
      return () => {
        timer.isCancelled = true;
      };
    },
  };
};
