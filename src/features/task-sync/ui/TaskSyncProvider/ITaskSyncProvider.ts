import type { TaskSyncBindings } from '@features/task-sync/model/taskSyncBindings';
import type { ReactNode } from 'react';

export interface ITaskSyncProviderProps {
  children: ReactNode;
  /**
   * Injected by tests, which mount the real data layer over an in-memory storage and a
   * fake transport. Left out in the app, where the defaults are MMKV and the live API.
   */
  bindings?: TaskSyncBindings;
}
