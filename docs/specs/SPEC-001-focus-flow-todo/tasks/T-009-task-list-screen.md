# T-009: Task list screen

## Meta

| Field         | Value                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Type          | feature                                                                                             |
| Size          | L                                                                                                   |
| Risk          | high                                                                                                |
| Status        | not-started                                                                                         |
| Languages     | TS                                                                                                  |
| Scope paths   | `src/screens/TaskList/**`, `src/entities/task/ui/**`, `src/widgets/**`, `src/features/task-list/**` |
| Blocked by    | T-006                                                                                               |
| Blocks        | T-011                                                                                               |
| Epic sections | §9.1 B1–B5, §8 FR-6 to FR-17                                                                        |

## Goal

Build the task list — the screen the assignment is really about — matching artboards B1 to B5.

## Scope

- Header: centred "To-do", **no back button, no search icon**. This is a deliberate correction
  to the original mock; the on-screen field is the only search affordance.
- Momentum card with completed and total counts and a progress bar. Expired tasks count.
- The decorative Focus-mode block and pro-tip card, visually subordinate. **(The Focus-mode
  block was removed after delivery — see the note at the foot of this file.)**
- Search field with a clear action, debounced at 200 ms, filtering by title on the client.
- The list, through `AppFlashList`, newest first, with completed tasks staying in place.
- The task row in all five states from the component sheet: default, completed, expired,
  expired-and-completed, and menu-open.
- The row's three-dot menu revealing Edit and Delete beneath the card.
- The delete confirmation modal naming the task.
- Two distinct empty states: no tasks, and no search results.
- The floating New task button.
- The offline banner driven by the sync store.

## Out of scope

- The new-task and edit screens — T-011.
- Any change to the queue or the hooks.

## Technical specification

### Row states — exact treatment from the component sheet

| State               | Card                                       | Checkbox                                    | Title                          | Chip                    |
| ------------------- | ------------------------------------------ | ------------------------------------------- | ------------------------------ | ----------------------- |
| default             | white, elevation 1                         | outline-variant border                      | text primary                   | container-high          |
| completed           | white, elevation 1                         | success fill with a white check             | text secondary, struck through | container-high          |
| expired             | container fill, no shadow, hairline border | disabled fill and border, **not pressable** | text tertiary                  | container-highest       |
| expired + completed | container fill, no shadow, hairline border | success fill with a check                   | text secondary, struck through | container-highest       |
| menu open           | primary outline inset                      | as its underlying state                     | as its underlying state        | as its underlying state |

In every state the three-dot button stays active, including expired.

### Expiry is derived

A task is expired when `expiresAt` is present and in the past, evaluated at render. Nothing
stores an expired flag. The screen recomputes on focus so a task that expires while the app is
backgrounded is correct when the user returns.

### Ordering

Newest first by `createdAt`. Completion does **not** reorder — a row must never jump out from
under the finger that just tapped it.

## Acceptance criteria

- **AC-1** — Given tasks with mixed states, when the list renders, then each row matches its
  state's treatment in the table above.
- **AC-2** — Given an expired task, when its checkbox is tapped, then nothing happens; when
  its three-dot button is tapped, then the menu opens.
- **AC-3** — Given a task completed before its expiry passed, when it renders, then it shows
  the completed treatment, not the plain expired one.
- **AC-4** — Given search text matching no title, when it settles, then the no-results empty
  state renders — visibly different from the no-tasks state.
- **AC-5** — Given Delete in the row menu, when it is tapped, then a modal names the task;
  cancelling leaves the task present, confirming removes it and queues the mutation.
- **AC-6** — Given a task is completed, when the list re-renders, then its position is
  unchanged and the momentum card's completed count increases by one.
- **AC-7** — Given the device is offline, when the list renders, then the offline banner is
  visible; when connectivity returns and the queue empties, then it disappears.

## Tests

**Strategy** — component tests over the row and the screen with a seeded query cache. The
visual match is manual against the artboards.

**Core scenarios**

- **S-1** — the five row states render their treatments — covers AC-1, AC-3
- **S-2** — the expired checkbox does not fire while its menu button does — covers AC-2 with
  its negative case
- **S-3** — search with no match renders no-results; an empty list renders no-tasks; the two
  differ — covers AC-4
- **S-4** — delete confirm removes and queues; delete cancel does neither — covers AC-5 with
  its negative case
- **S-5** — toggling completion does not reorder and updates the counter — covers AC-6

**Manual verification**

- [ ] B1 to B5 compared side by side with the artboards
- [ ] Offline banner appears in airplane mode and clears on reconnect
- [ ] Scrolling stays smooth with the list populated

## References

- Epic §9.1, §8
- Artboards B1–B5 and the component sheet in `Tech Assignment/design/`
- `TaskRow.dc.html` carries the exact per-state styling

## Additional scenarios found during implementation

Appended per the verification checklist §0. Each one is covered by a test.

- **S-6** — the momentum counts stay on the whole cache while a search narrows the view.
  Found by mutation testing: counting `visibleTasks` instead of `tasks` passed the suite as
  first written. FR-16 counts the day's work, not the filtered page.
- **S-7** — at most one row menu is open at a time, and pressing the same three-dot button
  again closes it. The design draws only the open state, so the closing rule was unstated.
- **S-8** — choosing Edit closes the menu before navigating, so returning from the detail
  screen does not land on an open menu.
- **S-9** — the floating "New task" button is hidden on the no-tasks state, whose own call to
  action replaces it. Artboard B4 draws no FAB; B5 does.
- **S-10** — the decorative focus-mode block and the pro-tip card appear only while the list
  has rows. Neither is drawn on B4 or B5. **(Half of this no longer ships: the focus-mode block
  is gone. The rule still governs the pro-tip card.)**
- **S-11** — the no-results copy names the **settled** query rather than the live field value,
  so the sentence and the list it explains cannot disagree mid-keystroke.

---

## Post-delivery note — the Focus-mode block was removed

Merged as `fix/remove-focus-mode-block` on 2026-09-02, after this task was signed off, at the
user's request: the block was decorative, reported no state, and was taking vertical space on
the one screen where rows compete for it.

That reverses `Tech Assignment/REQUIREMENTS.md` §7, which had agreed it would be "kept visually,
no behaviour behind it". The requirement changed; the code followed it.

The sentences above are left as they were written. This file is the record of what was executed
in this task, and editing it to match a later decision would turn an audit trail into a story —
so the correction is appended rather than applied. `epic.md` §26 carries the same change as a
versioned row, and the epic is the document to read for what the app does now.
