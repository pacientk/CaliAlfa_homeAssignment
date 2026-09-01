# T-011: New task and task detail / edit screens

## Meta

| Field         | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| Type          | feature                                                                            |
| Size          | L                                                                                  |
| Risk          | medium                                                                             |
| Status        | not-started                                                                        |
| Languages     | TS                                                                                 |
| Scope paths   | `src/screens/NewTask/**`, `src/screens/TaskDetail/**`, `src/features/task-form/**` |
| Blocked by    | T-006, T-009, T-010                                                                |
| Blocks        | —                                                                                  |
| Epic sections | §9.1 B6–B8, §8 FR-7, FR-11, FR-14, FR-15                                           |

## Goal

Build the create and edit screens, sharing one form, matching artboards B6, B7, and B8.

## Scope

- A shared form with four fields: title (required), description (multiline, optional),
  category (choose or type, optional), expiry (optional date and time).
- Inline validation feedback on the title, with the submit button disabled while invalid.
- **New task** — empty form, primary action "Add task", creates the task as not done.
- **Task detail / edit** — prefilled form, a completion toggle, a Delete action, and the
  created and expiry metadata shown.
- Category suggestions built from the distinct categories of the loaded tasks, plus whatever
  the user types.

## Out of scope

- Recurring tasks. The "Frequency" card in the original mock is decorative and does not
  promise a feature.
- Any new mutation behaviour. The form calls the hooks from T-006 as they are.

## Technical specification

### The form is one component used twice

Create and edit differ in three ways only: the initial values, the primary action's label and
handler, and whether the completion toggle and Delete are present. Everything else — layout,
validation, category suggestions, the expiry picker — is shared. Two near-identical screens
would be the DRY violation the rules warn about.

### Category field

The suggestion list is the distinct, non-empty `category` values of the tasks currently in the
cache, sorted alphabetically. The user may also type a value that is not in the list; it
becomes a category the moment the task is saved and therefore appears in future suggestions.
There is no separate category store — deriving the list from the tasks is the whole feature.

### Expiry field

Optional. Absent means the task never expires, and the field must make that state reachable:
a user who sets an expiry by accident needs a way to clear it. Date and time granularity,
since a task expiring "some time today" is the case the disabled state exists for.

### Validation feedback

The title calls `validateTitle` from T-010 on every change. Each rejection maps to its own
message in `strings.ts`; the submit button is disabled whenever a rejection is present.
Nothing is trimmed on the user's behalf.

## Acceptance criteria

- **AC-1** — Given the new-task form, when the title is empty, whitespace-only, padded, or a
  duplicate, then the submit button is disabled and the matching inline message shows; when it
  is clean and unique, then the button is enabled and no message shows.
- **AC-2** — Given a submitted new task, when it is created, then it appears at the top of the
  list as not done, and the query cache and the mutation queue both reflect it.
- **AC-3** — Given the edit screen for an existing task, when it opens, then every field is
  prefilled from the task, including an absent expiry rendering as empty rather than as a
  default date.
- **AC-4** — Given the category field, when it is opened, then it offers exactly the distinct
  categories present in the loaded tasks; when a new value is typed and saved, then it appears
  in the suggestions afterwards.
- **AC-5** — Given an expiry is set and then cleared, when the task is saved, then the stored
  task has no `expiresAt` and is not treated as expired.
- **AC-6** — Given Delete on the edit screen, when it is confirmed, then the task is removed
  and the user returns to the list.

## Tests

**Strategy** — component tests over the shared form with a seeded cache and a fake queue.

**Core scenarios**

- **S-1** — each rejection disables submit and shows its message; a clean title enables it —
  covers AC-1 with its negative case
- **S-2** — submitting writes to the cache and the queue, asserted by reading both back —
  covers AC-2
- **S-3** — prefill including an absent expiry — covers AC-3
- **S-4** — suggestions are the distinct categories, and a new one joins them — covers AC-4
- **S-5** — clearing an expiry stores no `expiresAt` — covers AC-5

**Additional scenarios found during implementation**

- **S-6** — the navigation bar's centred title spans the whole bar, so it must be drawn
  _before_ the back arrow or it swallows every tap on it. Found on the simulator; a press
  test cannot catch it, because the test renderer dispatches to the handler without
  hit-testing, so the assertion is on sibling order.
- **S-7** — on the edit screen the completion card pushes the category free-text field below
  the keyboard's top edge. `AppScrollView` gained an opt-in `shouldAvoidKeyboard`, which is
  UIKit's own content-inset adjustment, and the form sets it.

**Manual verification**

- [x] B6, B7, B8 compared with the artboards
- [x] The keyboard does not cover the field being edited on the simulator

## References

- Epic §9.1, §8
- Artboards B6–B8 in `Tech Assignment/design/`
- Cross-task interface: `T-010 §Technical specification → validateTitle`
