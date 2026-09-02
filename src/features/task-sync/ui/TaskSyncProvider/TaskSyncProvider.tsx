import { taskQueryKeys } from '@features/task-sync/model/taskQueryKeys';
import { createTaskSyncBindings } from '@features/task-sync/model/taskSyncBindings';
import { TaskSyncContext } from '@features/task-sync/model/TaskSyncContext';
import { useShouldAttempt } from '@store/syncStore';
import { QueryClientProvider } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

import type { ITaskSyncProviderProps } from './ITaskSyncProvider';

/**
 * Mounts the offline data layer: the engine, its query client — already holding the
 * stored task list — and the one-shot first sync.
 *
 * The bindings are built in the state initialiser rather than in an effect. That is the
 * whole of FR-18: MMKV is synchronous, so the cached list can be in the query cache
 * before the first render commits, and the list screen never shows the empty frame an
 * effect-based hydration would render first.
 */
export const TaskSyncProvider = ({
  children,
  bindings: injectedBindings,
}: ITaskSyncProviderProps): JSX.Element => {
  const [bindings] = useState(() => injectedBindings ?? createTaskSyncBindings());
  const shouldAttempt = useShouldAttempt();

  // Publishes every engine snapshot into the query cache and the sync store, and stops
  // when the provider unmounts.
  useEffect(() => bindings.connect(), [bindings]);

  useEffect(() => {
    // The store value is the trigger — it re-runs this effect when connectivity changes — and
    // the engine's own snapshot is the decision, because the store is one render behind during
    // the commit that first connects it.
    //
    // It gates on the permission rather than the belief. After an outage the belief only turns
    // true once a request has succeeded, and with an empty queue this sync is the only request
    // there is to make: gating on the belief would leave a cold start that failed offline
    // waiting for evidence that nothing was left to produce.
    if (!shouldAttempt || !bindings.engine.getSnapshot().shouldAttempt) {
      return;
    }
    // Prefetch rather than a query hook: nothing renders this result. It runs once per
    // app start, because the fetched query stays fresh forever, and a failed one is
    // retried by this same effect the next time connectivity returns.
    void bindings.queryClient.prefetchQuery({
      queryKey: taskQueryKeys.firstSync,
      queryFn: bindings.syncTasks,
    });
  }, [bindings, shouldAttempt]);

  return (
    <QueryClientProvider client={bindings.queryClient}>
      <TaskSyncContext.Provider value={bindings}>{children}</TaskSyncContext.Provider>
    </QueryClientProvider>
  );
};
