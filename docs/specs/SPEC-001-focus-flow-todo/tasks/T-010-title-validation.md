# T-010: Title validation

## Meta

| Field         | Value                      |
| ------------- | -------------------------- |
| Type          | feature                    |
| Size          | S                          |
| Risk          | medium                     |
| Status        | not-started                |
| Languages     | TS                         |
| Scope paths   | `src/entities/task/lib/**` |
| Blocked by    | T-004                      |
| Blocks        | T-011                      |
| Epic sections | §12.1, §8 FR-14            |

## Goal

Implement the three title rules from the assignment's own flow diagram as one pure function,
test-first.

## Context

These rules are the only business logic the assignment states explicitly, in the flow diagram
itself, which makes them the one place where a reviewer can check the implementation against a
written requirement word for word. They are pure and have no dependencies, so they are their
own task and are written before any form exists to call them.

## Scope

A single exported function and its result type. Nothing else.

## Out of scope

- The form and its error display — T-011.
- Trimming, normalising, or otherwise "helping" the user. The assignment states these as
  rejection rules, not as normalisation.

## Technical specification

```ts
type TitleRejection =
  | 'empty' // empty, or only whitespace
  | 'padded' // leading or trailing whitespace
  | 'duplicate'; // matches another task's title

interface TitleValidationInput {
  raw: string;
  existingTitles: readonly string[];
  editingTaskTitle?: string; // excluded from the duplicate check
}

function validateTitle(input: TitleValidationInput): TitleRejection | undefined;
```

### Rules, in evaluation order

1. **empty** — the trimmed value has zero length.
2. **padded** — the raw value differs from its trimmed value.
3. **duplicate** — the trimmed value equals an existing title, compared case-insensitively
   after trimming both sides. The task being edited never counts as a duplicate of itself.

Order matters and is part of the contract: `"   "` is `empty`, not `padded`, because that is
the more useful message.

### A property to be aware of

The live API already contains duplicate titles — two records named "Gloves" existed in the
seed data. The rule constrains what this app creates; it does not retroactively invalidate
what the server holds, and the list must render such records without complaint.

## Acceptance criteria

- **AC-1** — Given an empty string or one of only whitespace, then the result is `empty`.
- **AC-2** — Given a value with a leading or trailing space, then the result is `padded`.
- **AC-3** — Given a value equal to an existing title in a different case, then the result is
  `duplicate`.
- **AC-4** — Given a clean, unique value, then the result is `undefined`.
- **AC-5** — Given a task being edited and its own unchanged title, then the result is
  `undefined`, not `duplicate`.

## Tests

**Strategy** — unit tests, written before the implementation. Every rule gets its rejecting
case and its accepting case, per VR-05.

**Core scenarios**

- **S-1** — `""`, `"   "`, `"\t"` reject as `empty`; `"a"` does not — covers AC-1, AC-4
- **S-2** — `" a"`, `"a "` reject as `padded`; `"a b"` does not — covers AC-2, AC-4
- **S-3** — `"gloves"` against an existing `"Gloves"` rejects as `duplicate`; `"Glove"` does
  not — covers AC-3, AC-4
- **S-4** — editing a task and leaving its title unchanged is accepted — covers AC-5
- **S-5** — evaluation order: `"   "` is `empty`, not `padded` — covers AC-1

**Manual verification** — none; fully automated.

## References

- Epic §12.1
- The rules as written: `Tech Assignment/appflow.png`
