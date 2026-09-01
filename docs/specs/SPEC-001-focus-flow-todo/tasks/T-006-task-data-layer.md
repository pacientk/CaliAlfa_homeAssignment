# T-006: Task data layer — query hooks over the queue

## Meta

| Field         | Value                                                                            |
| ------------- | -------------------------------------------------------------------------------- |
| Type          | feature                                                                          |
| Size          | M                                                                                |
| Risk          | high                                                                             |
| Status        | not-started                                                                      |
| Languages     | TS                                                                               |
| Scope paths   | `src/features/task-sync/**`, `src/entities/task/model/**`, `src/shared/store/**` |
| Blocked by    | T-005                                                                            |
| Blocks        | T-009, T-011                                                                     |
| Epic sections | §11.2, §11.3, §16.6                                                              |

## Goal

Expose the task cache and the mutation queue to React as hooks, so screens never touch either
directly.

## Context

T-005 built the queue as plain TypeScript with no React in it, which is what made it testable
without a device. This task is the binding layer: TanStack Query owns the read model and
hydrates from the cache before its first fetch; the mutation hooks write through the queue.

## Scope

- A query client configured for an offline-first app.
- Cache hydration from MMKV before the first fetch resolves.
- `useTasks`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`,
  `useToggleTaskDone`.
- A sync-status store: online flag, pending count, last error.
- The first-sync pagination loop.

## Out of scope

- Screens.
- Any new queue behaviour. If a screen needs something the queue does not do, that is a
  finding against T-005, not a place to add logic here.

## Technical specification

### Hydration order

The cached list must render before any request is issued — this is FR-18 and it is the whole
point. MMKV reads are synchronous, so the query client is seeded with the cached list at
construction, not in an effect. An effect would render one empty frame first, which is
exactly the flicker the requirement exists to prevent.

### Mutation hooks

Every mutation hook does the same three things in the same order: apply the change
optimistically to the query cache, append an entry to the queue, and request a drain. It never
awaits the network — a mutation resolves as soon as it is queued, because that is what makes
the UI responsive offline.

### Sync status

```ts
interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  lastError?: string;
}
```

Consumed by the offline banner in T-009. The store holds only this; task data lives in the
query cache and is never mirrored here.

### First sync

Pages through `?p=&l=` until a short page comes back, then writes the full set to the cache.
Runs once per app start when online, not on every mount.

## Acceptance criteria

- **AC-1** — Given a populated cache and no network, when the app mounts, then the first
  render already contains the cached tasks and no request was issued.
- **AC-2** — Given a create through the hook, when it resolves, then the query cache already
  contains the task, the queue contains one entry, and the network has not been awaited.
- **AC-3** — Given the queue drains successfully, when the server returns the record, then the
  query cache holds the server's version and the pending count drops to zero.
- **AC-4** — Given a first sync over three pages, when it completes, then the cache holds
  every record from all three, verified by reading the cache back.

## Tests

**Strategy** — hook tests with React Native Testing Library's `renderHook` over a fake
transport and the in-memory storage double from T-005.

**Core scenarios**

- **S-1** — mount with a seeded cache and a transport that throws if called: assert the first
  render has data — covers AC-1
- **S-2** — create resolves before the transport is called; queue and cache both read back —
  covers AC-2
- **S-3** — drain reconciles the cache and clears pending — covers AC-3
- **S-4** — three-page sync, cache read back — covers AC-4

**Manual verification** — none; covered by T-009's walkthrough.

## References

- Epic §11.2, §11.3
- Cross-task interface: `T-005 §Types → QueuedMutation, CachedTask`

## Additional scenarios discovered during implementation

- **S-5 — the sync must replay the queue before it pages.** `mergeServerTasks` treats the
  server's list as authoritative for every record it is not told to protect, and it protects
  only the targets of entries _still_ queued. A first sync that paged before draining would
  therefore read a collection that predates its own queue, and a create confirmed a moment
  later would be erased by the merge that follows. `syncTasks` awaits `drain()` first.
  Covered by `taskSyncBindings.test.ts` — "replays the queue before it pages".
  A narrower race survives and is deliberately not handled: a mutation that drains _while_
  the pages are in flight is absent from the snapshot that was read, and its record is
  dropped from the cache until the next app start. Closing it needs either a re-read after
  the drain or a "recently confirmed" protection set in the engine; both are queue changes,
  which this task may not make.
- **S-6 — a failed first sync is retried by connectivity, not by a backoff.** The query is
  `retry: false` and is re-issued by the provider's effect when the sync store reports the
  device online again. A cold start with no network therefore syncs as soon as the first
  successful request proves connectivity, rather than after a fixed schedule.
- **S-7 — the read path is connectivity evidence too.** `syncTasks` reports its outcome to
  the connectivity service. Without it, a cold start with no network would leave the offline
  banner dark until the user's first _write_ failed.
- **S-8 — the sync store must name `lastError` when it writes.** Zustand merges shallowly, so
  a state object that simply omits a cleared error leaves the previous one on screen. Covered
  by a paired positive/negative test in `syncStore.test.ts`.
