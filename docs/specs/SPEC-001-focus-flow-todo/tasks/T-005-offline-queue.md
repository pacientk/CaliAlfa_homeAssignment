# T-005: Offline core — storage, mutation queue, and drain

## Meta

| Field         | Value                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Type          | feature                                                                                              |
| Size          | L                                                                                                    |
| Risk          | high                                                                                                 |
| Status        | not-started                                                                                          |
| Languages     | TS                                                                                                   |
| Scope paths   | `src/features/task-sync/**`, `src/shared/services/storage/**`, `src/shared/services/connectivity/**` |
| Blocked by    | T-004                                                                                                |
| Blocks        | T-006                                                                                                |
| Epic sections | §11.3, §12.2, §16.6                                                                                  |

## Goal

Build the persisted mutation queue and its drain loop — the piece the whole offline-first
claim rests on.

## Context

Epic §11.3 explains why offline lives in a queue in front of the API client rather than in a
local database or in the query cache. This task is the reason the spec is worth reviewing, so
it is built test-first and its scope is fixed by §12.2 — it does not grow.

## Scope

- An MMKV-backed storage service with typed get and set.
- The cached task list and its persistence.
- The mutation queue: append, peek, pop, persist, restore.
- The drain loop with ordering, backoff, id reconciliation, and terminal-failure rollback.
- A connectivity source.

## Out of scope

- React bindings and hooks — T-006.
- Any UI.

## Technical specification

### Types

```ts
type MutationKind = 'create' | 'update' | 'delete';

interface QueuedMutation {
  id: string; // queue entry id
  kind: MutationKind;
  taskId: string; // server id, or a local id for a task created offline
  payload: Partial<Task>; // absent for delete
  clientTimestamp: string;
  attempts: number;
}

interface CachedTask extends Task {
  isLocalId: boolean;
  lastLocalWriteAt: string;
}
```

### Invariants — these are the acceptance surface

1. Entries drain strictly in order, so a create always precedes an update that depends on it.
2. When a create succeeds, the server id replaces the local id in the cache **and in every
   later queued entry that targets it**.
3. A retryable failure increments `attempts` and backs off; the entry stays at the head.
4. A terminal failure discards the entry, rolls its optimistic change back, and surfaces once.
5. A `notFound` on update or delete removes the local copy rather than retrying.
6. Conflict resolution is last-write-wins by `lastLocalWriteAt` against the server record.
7. The queue survives a process restart: it is persisted on every mutation, not on an interval.

### Drain policy

Backoff is exponential with a ceiling, and draining stops entirely while offline rather than
burning attempts against a known-down network.

## Acceptance criteria

- **AC-1** — Given a create and then an update queued offline, when the queue drains, then the
  create is sent first and the update is sent against the id the server returned, verified by
  reading the queue and the cache back after the drain.
- **AC-2** — Given a queue with entries, when the process restarts, then the restored queue is
  identical, verified by reading it out of storage rather than from memory.
- **AC-3** — Given a terminal 4xx on the head entry, when the drain runs, then the entry is
  gone, the optimistic change is rolled back in the cache, and no retry is attempted.
- **AC-4** — Given a retryable 5xx, when the drain runs, then the entry remains at the head
  with an incremented attempt count.
- **AC-5** — Given the device is offline, when a drain is requested, then no request is issued.
- **AC-6** — Given a server record newer than the local one, when they are merged, then
  last-write-wins by client timestamp decides, in both directions.

## Tests

**Strategy** — unit tests against a fake transport and an in-memory storage double that
implements the same interface as MMKV. No device needed. This is the task where VR-01 and
VR-02 bind hardest: every assertion reads the store back rather than observing that a helper
was called.

**Core scenarios**

- **S-1** — create then update, offline, then drain: assert the request sequence and the
  reconciled id read back from the cache — covers AC-1
- **S-2** — persist, discard the in-memory instance, restore: assert from storage — covers AC-2
- **S-3** — terminal failure: assert the entry is gone and the cache reverted — covers AC-3
- **S-4** — retryable failure: assert the entry is still at the head with attempts + 1, and
  the paired case that a success removes it — covers AC-4 with its negative case
- **S-5** — offline: assert the transport was never called — covers AC-5
- **S-6** — merge in both directions — covers AC-6

**Manual verification**

- [ ] Airplane mode: create and edit, restart the app, restore the network, then confirm both
      changes on the server with a direct API read — not by looking at the app

## Additional scenarios found during implementation

Appended per verification-checklist §0. Each is covered by a test unless marked otherwise.

- **A task deleted while its update is in flight must not come back.** When an update and a
  delete are queued against the same task, the update drains first and its response would
  re-insert the record the delete had already removed optimistically — visible for one frame,
  and persisted in that state if the process died in between. The merge on update success is
  therefore guarded on the record still being cached.
- **A create that fails terminally orphans the entries queued behind it.** They target a
  local id the server never issued, so each one 404s and is dropped by the `notFound` path.
  Self-healing, and deliberately not special-cased: collapsing the queue would be more code
  than the case is worth.
- **A rolled-back entry leaves later entries for the same task holding a stale `previous`
  snapshot.** Rolling one of those back restores a state that never reached the server.
  Known limitation; the alternative is a per-task rollback chain, which is out of proportion
  to this scope. Not covered by a test, because the behaviour is not one worth pinning.
- **A persisted record that fails its guard is dropped, not thrown on.** Restore runs during
  app start, so one malformed entry written by an older build must cost one unsynced change
  rather than the ability to open the app.
- **Anything other than an `ApiError` escaping the transport is treated as terminal.** The API
  layer throws nothing else, so it means a defect in this app; retrying it would block every
  entry behind it forever.
- **`mergeServerTasks` protects a task with a queued entry from the server's version.** A
  first sync must not overwrite an edit that has not drained, nor resurrect a task whose
  delete is still queued.

## References

- Epic §11.3, §12.2, §16.6
- Cross-task interface: `T-004 §Types → Task`, `T-004 §Error classification → ApiFailure`
