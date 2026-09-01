# T-004: Task entity and API client

## Meta

| Field         | Value                                             |
| ------------- | ------------------------------------------------- |
| Type          | feature                                           |
| Size          | M                                                 |
| Risk          | medium                                            |
| Status        | not-started                                       |
| Languages     | TS                                                |
| Scope paths   | `src/entities/task/model/**`, `src/shared/api/**` |
| Blocked by    | —                                                 |
| Blocks        | T-005, T-010                                      |
| Epic sections | §10, §13                                          |

## Goal

Define the Task domain type and the typed service functions that are the only way the app
talks to the task API.

## Context

Dependency inversion in `principles.md` requires features to reach the network through typed
services rather than constructing requests inline. This task builds that seam, and it can run
in parallel with the UI foundation because it touches no component.

## Scope

- The `Task` domain type and its mapping to and from the API's wire shape.
- An HTTP client over `fetch` with a base URL, JSON handling, a timeout, and typed errors.
- Service functions: list a page, read one, create, update, delete.
- Error classification: retryable versus terminal.

## Out of scope

- Caching, queuing, and retries — those are T-005.
- React Query hooks — those are T-006.

## Technical specification

### Types

```ts
// src/entities/task/model/Task.ts
interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  isDone: boolean;
  createdAt: string; // ISO-8601
  expiresAt?: string; // ISO-8601; absent means never expires
}
```

The wire shape uses `is_done`; the mapper is the only place that knows this. Everything above
`shared/api/` speaks the domain shape.

### Service contracts

```
GET    /tasks?p={page}&l={limit}   → Task[]
GET    /tasks/:id                  → Task
POST   /tasks                      → Task     body: title, description, category, is_done, createdAt, expiresAt?
PUT    /tasks/:id                  → Task     partial body; the service merges
DELETE /tasks/:id                  → Task
```

`createdAt` is always sent on create. The service invents a faker value when it is omitted,
which would give an offline task the wrong moment.

### Error classification

```ts
type ApiFailure =
  | { kind: 'offline' } // no connectivity
  | { kind: 'transport'; cause: unknown } // DNS, timeout, socket
  | { kind: 'server'; status: number } // 5xx, 408, 429 — retryable
  | { kind: 'notFound' } // 404 — the record is gone
  | { kind: 'client'; status: number }; // other 4xx — terminal
```

`offline`, `transport`, and `server` are retryable. `notFound` and `client` are terminal.
This classification is the input to the queue's drain policy in T-005, so it is exported.

## Acceptance criteria

- **AC-1** — Given a wire record with `is_done`, when it is mapped, then the domain object
  carries `isDone` and every other field round-trips unchanged.
- **AC-2** — Given a create call, when the request is built, then it always carries a
  `createdAt`.
- **AC-3** — Given each HTTP status class, when the client receives it, then it produces the
  matching `ApiFailure` kind.
- **AC-4** — Given a wire record with `expiresAt` absent, when it is mapped, then the domain
  object has no `expiresAt` rather than a null or an empty string.

## Tests

**Strategy** — unit tests against a stubbed `fetch`. No test touches the live service; the
resource is shared and its contents are not guaranteed.

**Core scenarios**

- **S-1** — mapping round-trips a full record and a minimal one — covers AC-1, AC-4
- **S-2** — create always sends `createdAt` — covers AC-2
- **S-3** — 500, 404, and 422 each produce the right failure kind, and a 200 produces none —
  covers AC-3 with its negative case
- **S-4** — a network rejection produces `transport`, not an unhandled throw — covers AC-3

**Manual verification** — none; fully automated.

## References

- Epic §10, §13
- Verified API behaviour: `Tech Assignment/REQUIREMENTS.md` § Verified API behaviour
