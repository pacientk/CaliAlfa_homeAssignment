import { taskQueryKeys } from '../model/taskQueryKeys';
import { useTaskSyncBindings } from '../model/TaskSyncContext';

/** Runs the first sync again. Never rejects: the caller is a button, not a supervisor. */
export type RetryFirstSyncAction = () => Promise<void>;

/**
 * The remedy for a first sync the server refused.
 *
 * Nothing else re-runs it. The provider's effect fires on connectivity changing, and a 5xx
 * leaves connectivity reporting online — correctly, the server answered — so a failed read
 * would otherwise stay failed until the app was restarted. This is the only path back.
 *
 * `staleTime: 0` is passed explicitly rather than relying on the errored query being stale
 * by default: the client-wide default is `Infinity`, and a retry that quietly resolved from
 * cache would be a button that looks like it works and does nothing.
 */
export const useRetryFirstSync = (): RetryFirstSyncAction => {
  const { queryClient, syncTasks } = useTaskSyncBindings();

  return async (): Promise<void> => {
    try {
      await queryClient.fetchQuery({
        queryKey: taskQueryKeys.firstSync,
        queryFn: syncTasks,
        staleTime: 0,
      });
    } catch {
      // `syncTasks` has already recorded the failure for the sheet to render. Rethrowing
      // would only hand a rejection to a press handler with nowhere to put it.
    }
  };
};
