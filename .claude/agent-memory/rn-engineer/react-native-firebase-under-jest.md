---
name: react-native-firebase-under-jest
description: Importing @react-native-firebase/* is fatal under Jest; a root __mocks__ entry is the fix, and tsconfig must include it
metadata:
  type: project
---

`@react-native-firebase/*` ships untranspiled ES modules and the React Native Jest preset
does not transform `node_modules`, so _importing_ the package throws
`SyntaxError: Cannot use import statement outside a module` — before any call is made. A
manual mock at `__mocks__/@react-native-firebase/<pkg>.ts` fixes every suite at once,
because Jest applies a root manual mock for a `node_modules` package automatically, with no
`jest.mock` call in the suite.

**Why:** this matters far outside the auth feature. Any suite that renders the navigator
transitively imports the session store, which imports the SDK. Without the global mock,
tests owned by other tasks fail at import for a reason that has nothing to do with them.

**How to apply:** write the mock in TypeScript and add `"__mocks__"` to `tsconfig.json`'s
`include`, or `tsc` will not check it and ESLint's `projectService` will refuse to lint a
file that belongs to no project. Give the mock inert defaults — a listener that never emits,
promises that resolve — so a suite that does not care about the provider sees a store that
stays in its initial state.
