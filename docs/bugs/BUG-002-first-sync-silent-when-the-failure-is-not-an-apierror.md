# BUG-002 — A first sync that fails with anything but an `ApiError` is still silent

## Meta

| Field               | Value                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| ID                  | `BUG-002`                                                                   |
| Title               | `A first sync that fails with anything but an ApiError is still silent`     |
| Slug                | `first-sync-silent-when-the-failure-is-not-an-apierror`                     |
| Severity            | `low`                                                                       |
| Discovered          | `2026-09-02`                                                                |
| Discovered during   | `post-delivery review of the error paths, while closing the FR-27 gap`      |
| Status              | `open`                                                                      |
| Originating SPEC    | `SPEC-001 §8 FR-27` — a first sync that fails is reported in the foreground |
| Suggested fix track | `hotfix`                                                                    |

## Component

- **File path(s):** `src/features/task-sync/model/taskSyncBindings.ts` — the `catch` in
  `syncTasks`.
- **Package(s):** `@features/task-sync`.
- **Feature area:** the offline data layer, read path.

## Repro

Not reachable from the product. Every throw on this path is an `ApiError` today:
`requestJson` classifies transport faults and HTTP statuses into one, and `parseTaskList`
raises `malformedResponse`, which is also one. Reaching this branch takes a defect in this
app's own code — a `TypeError` inside the paging loop, say.

To see it in a test: make a `TaskPageSource` double reject with a plain `Error` and call
`bindings.syncTasks()`. `useSyncStore.getState().firstSyncError` stays `undefined`.

## Expected vs actual

**Expected** (`FR-27`): a first sync that fails without the device being offline is
reported in the foreground with a retry.

**Actual:** the report is gated on `isApiError(error)`. Anything else is re-thrown to a
`prefetchQuery` that has no observer, so it is swallowed — the same silence FR-27 was
written to end, in the one case where the cause is a bug rather than a server.

## Evidence

```ts
} catch (error) {
  if (isApiError(error)) {
    connectivity.reportFailure(error.failure);
    if (connectivity.getIsOnline()) {
      useSyncStore.getState().setFirstSyncError(error.failure.kind);
    }
  }
  throw error;
}
```

The write path already takes the other view. `taskSyncEngine.settleFailure` treats a
non-`ApiError` as terminal and says so in a comment: "The API layer throws nothing else, so
this is a defect in this app rather than a network condition." The two paths disagree about
the same class of error.

## Test status

`n/a — found by reading, not by a failing test`. No test is skipped and none is annotated
with this bug's token, so the repo-wide `grep -rEn 'blocked by BUG-[0-9]+' .` reconciliation
stays empty.

## Recommendation

`hotfix`, and small: move the `throw` out of the guard's shadow by recording a failure for
the non-`ApiError` case too. The honest wording is the difficulty, not the plumbing — none
of the five `ApiFailure` kinds describes "this app has a bug", and reusing `transport` would
tell the user we could not reach a server we in fact reached. The fix is worth doing
together with a sixth kind, or a sheet message that does not claim to know the cause.

**Deliberately left open** rather than fixed in the same pass as FR-27: inventing a failure
kind is a change to the type the whole sync layer branches on, and that is not a change to
make as a rider on someone else's fix.

## Resolution (filled when status flips to `closed`)
