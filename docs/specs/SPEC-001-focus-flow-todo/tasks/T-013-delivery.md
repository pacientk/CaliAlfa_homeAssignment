# T-013: Delivery — README, readiness notes, and the end-to-end pass

## Meta

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Type          | docs                                                 |
| Size          | M                                                    |
| Risk          | medium                                               |
| Status        | not-started                                          |
| Languages     | TS, Markdown                                         |
| Scope paths   | `README.md`, `docs/prod-readiness.md`, `.maestro/**` |
| Blocked by    | T-008, T-009, T-011, T-012                           |
| Blocks        | —                                                    |
| Epic sections | §11.4, §18.4                                         |

## Goal

Make the repository readable and runnable by someone who has never seen it, and verify the
whole thing end to end on a clean clone.

## Context

The reviewer's first ten minutes decide most of the impression, and they will be spent in the
README and on the first launch. A working app that is awkward to run reads as a worse
submission than it is.

## Scope

- A README covering: what it is, how to run it, the test credentials, the architecture and why
  it is shaped that way, the decisions and their trade-offs, and the known limitations.
- `docs/prod-readiness.md` listing the Firebase console items no agent can perform.
- The full manual verification pass from epic §18.4.
- A clean-clone run: fresh clone, install, pods, build, launch.
- One Maestro flow, if the schedule allows. It is a bonus and is dropped without apology if
  time is short.

## Out of scope

- New features. Anything discovered here that is not a defect goes to `docs/future-work.md`.

## Technical specification

### The README says the awkward things out loud

Three limitations must be stated plainly rather than left to be discovered:

1. **Only the Firebase test number can sign in.** There is no APNs auth key, so real numbers
   cannot complete device verification on a simulator.
2. **React Native is pinned to 0.80.3**, because 0.81+ requires Xcode 16.1 and the build
   machine has 16.0. Every native library is pinned to its matching line.
3. **Tasks are not scoped per user.** The supplied API has no owner field and is a single
   shared resource; every signed-in user sees the same list.

A submission that hides these reads worse than one that names them.

### The architecture section

Short, and about decisions rather than folder listings: why the mutation queue sits in front
of the API client instead of a local database, why server state never enters the Zustand
store, why the atom layer exists at all. Point at `docs/architecture/` for the rules and at
`docs/specs/SPEC-001-focus-flow-todo/` for the reasoning.

## Acceptance criteria

- **AC-1** — Given a fresh clone on a clean machine, when the README's instructions are
  followed exactly, then the app builds and launches with no undocumented step.
- **AC-2** — Given the README, when it is read, then all three limitations above are stated.
- **AC-3** — Given epic §18.4, when the checklist is walked, then every item passes or is
  recorded as a known issue with its reason.
- **AC-4** — Given the repository, when it is inspected, then no skipped test points at a
  non-existent BUG-NNN and every filed bug has its sections filled.

## Tests

**Strategy** — the verification here is the clean-clone run itself. Per VR-12, done means
another engineer can reproduce the green state from scratch, so the README's command sequence
is executed verbatim rather than approximated from memory.

**Core scenarios**

- **S-1** — clean clone, `npm ci`, `pod install`, build, launch, sign in — covers AC-1
- **S-2** — the full §18.4 checklist — covers AC-3

**Manual verification**

- [ ] Every item of epic §18.4
- [ ] The airplane-mode cycle confirmed by reading the server directly, not by trusting the UI

## References

- Epic §11.4, §18.4
- Standards: `docs/architecture/`
