/**
 * The two query keys this app has. Constants rather than inline arrays so the seeding
 * that happens at query-client construction and the hook that reads it cannot drift.
 */
export const taskQueryKeys = {
  /** The cached task list — the read model every screen renders from. */
  list: ['tasks'] as const,
  /** The one-shot pagination sync. Separate from the list so it can be fetched without
   * making the list itself stale, which would cost the cold-start render (FR-18). */
  firstSync: ['tasks', 'first-sync'] as const,
};
