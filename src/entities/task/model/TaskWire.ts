/**
 * The record shape the API stores and returns. It differs from {@link Task} in one
 * place — `is_done` — and this file plus the mapper are the only code that knows it.
 */
export interface TaskWire {
  id: string;
  title: string;
  description: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention -- the API dictates this snake_case field name; TaskWire and the mapper are the only places it appears.
  is_done: boolean;
  createdAt: string;
  /** The service is loosely typed and has been seen to omit this or return null. */
  expiresAt?: string | null;
}

/**
 * The body of a `POST /tasks`. No `id` — the service issues it.
 *
 * `expiresAt` is required here, unlike on {@link TaskWire}: the service invents a
 * random expiry for a create that omits the key, so `null` has to be sent explicitly.
 */
export type TaskWireDraft = Omit<TaskWire, 'id' | 'expiresAt'> & {
  expiresAt: string | null;
};

/** The body of a `PUT /tasks/:id`. The service merges it into the stored record. */
export type TaskWirePatch = Partial<Omit<TaskWire, 'id'>>;
