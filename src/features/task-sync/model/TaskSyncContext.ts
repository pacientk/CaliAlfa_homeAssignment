import { createContext, useContext } from 'react';

import type { TaskSyncBindings } from './taskSyncBindings';

/**
 * The engine and its query client, handed down from the provider. A context rather than a
 * module singleton so a test can mount the whole data layer over an in-memory storage and
 * a fake transport without touching global state.
 */
export const TaskSyncContext = createContext<TaskSyncBindings | undefined>(undefined);

export const useTaskSyncBindings = (): TaskSyncBindings => {
  const bindings = useContext(TaskSyncContext);
  if (bindings === undefined) {
    throw new Error('useTaskSyncBindings must be used inside <TaskSyncProvider>.');
  }
  return bindings;
};
