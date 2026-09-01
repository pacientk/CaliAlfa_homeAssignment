---
name: rntl-v14-element-type-and-async-events
description: RNTL v14 queries return its own bundled renderer's TestInstance, and fireEvent must be awaited
metadata:
  type: project
---

Two shapes that cost time in every suite written against React Native Testing Library v14.

**`fireEvent` is async.** `await fireEvent.press(...)` and `await fireEvent.changeText(...)`.
Without the `await` the state the event causes is never committed: the assertion that follows
reads the pre-event tree, and later cases in the same file fail with "unable to find an element"
because the render they depend on never happened. React logs "You seem to have overlapping
act() calls" — which reads like a test-harness problem rather than a missing keyword.

**Its queries do not return `ReactTestInstance`.** v14 bundles its own renderer, so
`screen.getByTestId` returns a `TestInstance` from the `test-renderer` package; the two types
are mutually unassignable and `tsc` rejects any helper typed for `react-test-renderer` —
including `shared/ui/atoms/testing/renderWithTheme.ts`'s `readProp`, which predates v14 and is
typed for the old renderer. Either type the helper structurally (`{ props: Record<string,
unknown> }`, which both satisfy) or write `ReturnType<typeof screen.getByTestId>`. Do not import
`test-renderer` directly — it is a transitive dependency.

**How to apply:** an async-looking failure in a v14 suite is a missing `await` on `fireEvent`
before it is anything else. `src/features/auth/testing/renderedElement.ts` holds the structural
helpers (`propOf`, `styleOf`, `isDisabled`) that the resolved-style assertions the verification
checklist asks for are built on.
