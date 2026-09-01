/**
 * The one domain entity. Everything above `shared/api/` speaks this shape; the wire
 * shape and its `is_done` spelling stop at the mapper.
 */
export interface Task {
  /** Server identifier. Opaque — never parsed, never assumed stable across resets. */
  id: string;
  title: string;
  /** Free text; may be empty. */
  description: string;
  /** Free text label; may be empty. */
  category: string;
  isDone: boolean;
  /** ISO-8601. Client-supplied on create so an offline task keeps the moment it was written. */
  createdAt: string;
  /** ISO-8601. Absent — not null, not empty — means the task never expires. */
  expiresAt?: string;
}

/**
 * What a create carries.
 *
 * Both timestamps are required rather than optional, for the same reason: the service
 * invents a faker value for a key it does not receive. An omitted `createdAt` loses the
 * moment the user actually wrote the task; an omitted `expiresAt` silently acquires a
 * random deadline about a year out, which would later render the task as expired. The
 * type is what makes both bugs impossible — neither relies on a caller remembering.
 */
export interface TaskDraft {
  title: string;
  description: string;
  category: string;
  isDone: boolean;
  /** ISO-8601, captured when the user wrote the task, not when the request drains. */
  createdAt: string;
  /** ISO-8601, or `null` for a task that never expires. Always sent. */
  expiresAt: string | null;
}

/**
 * What an update carries. `PUT` on this API is a merge, so a field absent from this
 * object keeps its current server value.
 *
 * `expiresAt` therefore has three states rather than two: absent leaves the stored
 * expiry alone, `null` clears it, and a string sets it. It cannot be derived from
 * `Task` — the domain type has no null.
 */
export type TaskChanges = Partial<Pick<Task, 'title' | 'description' | 'category' | 'isDone'>> & {
  expiresAt?: string | null;
};
