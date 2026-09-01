import type { TaskChanges, TaskDraft } from '@entities/task/model';

import type { CachedTask } from './CachedTask';
import { isCachedTask } from './CachedTask';

export type MutationKind = 'create' | 'update' | 'delete';

interface QueuedMutationBase {
  /** Identifies the queue entry itself, not the task. */
  id: string;
  /** The task the entry targets: a server id, or a local id for a task created offline. */
  taskId: string;
  /** ISO-8601 moment the user made the change — not the moment the request is sent. */
  clientTimestamp: string;
  attempts: number;
}

export interface QueuedCreate extends QueuedMutationBase {
  kind: 'create';
  payload: TaskDraft;
}

export interface QueuedUpdate extends QueuedMutationBase {
  kind: 'update';
  payload: TaskChanges;
  /** The cached record as it was before the optimistic change, for rollback. */
  previous: CachedTask;
}

export interface QueuedDelete extends QueuedMutationBase {
  kind: 'delete';
  /** The removed record, so a terminal failure can put it back. */
  previous: CachedTask;
}

/**
 * One accepted write, waiting to reach the server.
 *
 * A discriminated union rather than the `payload: Partial<Task>` the task file sketched,
 * for two reasons that only became clear against T-004's finished API:
 *
 * - `Partial<Task>` cannot express `expiresAt: null`, and `null` is the wire sentinel for
 *   "no expiry". A create typed as `Partial<Task>` could omit the key, and the service
 *   would then invent a random expiry — the exact bug T-004's `TaskDraft` exists to make
 *   impossible. The union lets each kind carry the type the API actually takes.
 * - `previous` has no home in the sketch, and an update cannot be rolled back without it:
 *   inverting a partial change requires knowing what it overwrote. Storing the whole prior
 *   record rather than the overwritten fields also settles "this task had no expiry",
 *   which a field-level merge cannot express.
 */
export type QueuedMutation = QueuedCreate | QueuedUpdate | QueuedDelete;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

const isOptionalBoolean = (value: unknown): boolean =>
  value === undefined || typeof value === 'boolean';

const isTaskDraft = (value: unknown): value is TaskDraft => {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.title !== 'string' || typeof value.description !== 'string') {
    return false;
  }
  if (typeof value.category !== 'string' || typeof value.isDone !== 'boolean') {
    return false;
  }
  if (typeof value.createdAt !== 'string') {
    return false;
  }
  return value.expiresAt === null || typeof value.expiresAt === 'string';
};

const isTaskChanges = (value: unknown): value is TaskChanges => {
  if (!isRecord(value)) {
    return false;
  }
  if (!isOptionalString(value.title) || !isOptionalString(value.description)) {
    return false;
  }
  if (!isOptionalString(value.category) || !isOptionalBoolean(value.isDone)) {
    return false;
  }
  return value.expiresAt === null || isOptionalString(value.expiresAt);
};

const hasValidBaseFields = (value: Record<string, unknown>): boolean => {
  if (typeof value.id !== 'string' || typeof value.taskId !== 'string') {
    return false;
  }
  if (typeof value.clientTimestamp !== 'string') {
    return false;
  }
  return typeof value.attempts === 'number' && Number.isFinite(value.attempts);
};

/** Validates one entry restored from storage. See {@link isCachedTask} for why. */
export const isQueuedMutation = (value: unknown): value is QueuedMutation => {
  if (!isRecord(value) || !hasValidBaseFields(value)) {
    return false;
  }
  if (value.kind === 'create') {
    return isTaskDraft(value.payload);
  }
  if (value.kind === 'update') {
    return isTaskChanges(value.payload) && isCachedTask(value.previous);
  }
  return value.kind === 'delete' && isCachedTask(value.previous);
};
