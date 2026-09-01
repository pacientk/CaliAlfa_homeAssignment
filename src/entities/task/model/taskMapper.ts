import type { Task, TaskChanges, TaskDraft } from './Task';
import type { TaskWire, TaskWireDraft, TaskWirePatch } from './TaskWire';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** The service returns `expiresAt` as a string, as null, or not at all. */
const isOptionalTimestamp = (value: unknown): boolean =>
  value === undefined || value === null || typeof value === 'string';

/**
 * Validates a value straight off the wire. Every field the domain relies on must be
 * present and of the right type; a record that fails this is rejected rather than
 * mapped into a half-empty `Task`.
 */
export const isTaskWire = (value: unknown): value is TaskWire => {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.id !== 'string' || typeof value.title !== 'string') {
    return false;
  }
  if (typeof value.description !== 'string' || typeof value.category !== 'string') {
    return false;
  }
  if (typeof value.is_done !== 'boolean' || typeof value.createdAt !== 'string') {
    return false;
  }
  return isOptionalTimestamp(value.expiresAt);
};

/**
 * Wire record to domain object. A missing, null, or empty `expiresAt` produces a
 * `Task` with no `expiresAt` key at all, so "never expires" is one condition rather
 * than three.
 */
export const toTask = (wire: TaskWire): Task => {
  const task: Task = {
    id: wire.id,
    title: wire.title,
    description: wire.description,
    category: wire.category,
    isDone: wire.is_done,
    createdAt: wire.createdAt,
  };
  const expiresAt = wire.expiresAt;
  if (typeof expiresAt !== 'string' || expiresAt === '') {
    return task;
  }
  return { ...task, expiresAt };
};

/**
 * Create payload. Both timestamps are always present because {@link TaskDraft} requires
 * them — the service invents a faker value for either key it does not receive, so
 * "no expiry" has to travel as an explicit `null` rather than as an omission.
 */
export const toWireDraft = (draft: TaskDraft): TaskWireDraft => ({
  title: draft.title,
  description: draft.description,
  category: draft.category,
  is_done: draft.isDone,
  createdAt: draft.createdAt,
  expiresAt: draft.expiresAt,
});

/**
 * Update payload. Only the fields the caller actually supplied are sent, because the
 * service merges: sending `undefined` for a field would be indistinguishable from not
 * sending it, and sending a stale value would overwrite a newer one.
 *
 * `expiresAt` is the one field with three states. An absent key leaves the stored expiry
 * alone; an explicit `null` clears it, which the service honours; a string sets it.
 */
export const toWirePatch = (changes: TaskChanges): TaskWirePatch => {
  const patch: TaskWirePatch = {};
  if (changes.title !== undefined) {
    patch.title = changes.title;
  }
  if (changes.description !== undefined) {
    patch.description = changes.description;
  }
  if (changes.category !== undefined) {
    patch.category = changes.category;
  }
  if (changes.isDone !== undefined) {
    patch.is_done = changes.isDone;
  }
  if (changes.expiresAt !== undefined) {
    patch.expiresAt = changes.expiresAt;
  }
  return patch;
};
