import type { KeyValueStorage } from '@shared/services/storage';
import { createMemoryStorage } from '@shared/services/storage';
import { SYNC_STORE_INITIAL_STATE, useSyncStore } from '@store/syncStore';
import { notifyManager } from '@tanstack/react-query';
import type { JSX, ReactNode } from 'react';

import type { TaskPageSource } from '../model/TaskPageSource';
import type { TaskSyncBindings } from '../model/taskSyncBindings';
import { createTaskSyncBindings } from '../model/taskSyncBindings';
import { TaskSyncProvider } from '../ui/TaskSyncProvider';
import type {
  FakeConnectivity,
  FakePageSource,
  FakeTransport,
  ScheduledTimer,
} from './taskSyncDoubles';
import {
  createFakeConnectivity,
  createFakePageSource,
  createFakeTransport,
  createTimerRecorder,
} from './taskSyncDoubles';
import { isoAt } from './taskSyncFixtures';

interface ITaskSyncWrapperProps {
  children: ReactNode;
}

export interface TaskSyncHarnessOptions {
  /** Kept by a test that proves data survived a restart: the storage outlives the engine. */
  storage: KeyValueStorage;
  isInitiallyOnline: boolean;
  pageSize: number;
  /** Overrides the recording double — used by the test that must fail if paged at all. */
  pageSource: TaskPageSource;
}

export interface TaskSyncHarness {
  storage: KeyValueStorage;
  connectivity: FakeConnectivity;
  transport: FakeTransport;
  pageSource: FakePageSource;
  timers: ScheduledTimer[];
  bindings: TaskSyncBindings;
  /** Mounts the real provider over the doubles. */
  Wrapper: (props: ITaskSyncWrapperProps) => JSX.Element;
  /** Moves the injected clock forward one second. */
  advanceClock: () => void;
}

/**
 * The whole data layer over an in-memory storage and fakes: the real engine, the real
 * bindings, the real provider. Nothing here mocks the code under test — only the two
 * edges it cannot own in a test process, the network and the disk.
 */
/**
 * The sync store is a module singleton. Reset it before each test rather than inside the
 * harness: writing to it while a provider from an earlier arrangement is still mounted
 * would re-render that provider outside `act`.
 */
export const resetSyncStore = (): void => {
  useSyncStore.getState().setSyncState(SYNC_STORE_INITIAL_STATE);
};

export const setupTaskSync = (options: Partial<TaskSyncHarnessOptions> = {}): TaskSyncHarness => {
  // React Query batches observer notifications through a timer, which would make a cache
  // written synchronously by the engine arrive a macrotask after the write. That is a
  // property of the scheduler, not of the code under test, and it makes every assertion
  // about "what is on screen now" race the batcher.
  notifyManager.setScheduler(run => {
    run();
  });

  const storage = options.storage ?? createMemoryStorage();
  const connectivity = createFakeConnectivity(options.isInitiallyOnline ?? true);
  const transport = createFakeTransport();
  const pageSource = createFakePageSource();
  const recorder = createTimerRecorder();
  let step = 1;
  let idCount = 0;

  const bindings = createTaskSyncBindings({
    storage,
    connectivity,
    transport,
    pageSource: options.pageSource ?? pageSource,
    now: () => isoAt(step),
    createId: () => {
      idCount += 1;
      return `gen-${idCount}`;
    },
    scheduleTimer: recorder.scheduleTimer,
    ...(options.pageSize === undefined ? {} : { pageSize: options.pageSize }),
  });

  return {
    storage,
    connectivity,
    transport,
    pageSource,
    timers: recorder.timers,
    bindings,
    Wrapper: ({ children }: ITaskSyncWrapperProps): JSX.Element => (
      <TaskSyncProvider bindings={bindings}>{children}</TaskSyncProvider>
    ),
    advanceClock: (): void => {
      step += 1;
    },
  };
};
