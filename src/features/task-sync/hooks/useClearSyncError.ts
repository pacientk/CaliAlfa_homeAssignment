import { useTaskSyncBindings } from '../model/TaskSyncContext';

export type ClearSyncErrorAction = () => void;

/**
 * Dismisses the last failure the queue gave up on, so the banner can be closed. Without
 * it a single terminal failure would sit on screen for the rest of the session — nothing
 * else clears `lastFailure`.
 */
export const useClearSyncError = (): ClearSyncErrorAction => {
  const { engine } = useTaskSyncBindings();
  return (): void => {
    engine.clearLastFailure();
  };
};
