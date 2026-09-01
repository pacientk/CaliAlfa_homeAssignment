---
name: react-navigation-tab-bar-and-rntl
description: The tabBar option is called as a function, and RNTL v14's render/renderHook are async
metadata:
  type: reference
---

Two shapes that produce confusing failures in navigator tests.

**`tabBar` must be a render callback, not the component.** React Navigation calls the option
as a plain function during `BottomTabView`'s own render. Passing `tabBar={TabBar}` therefore
runs the bar's hooks inside the navigator's render, and with the React Compiler enabled it
fails with "Invalid hook call" from `react-compiler-runtime`. Pass
`tabBar={props => <TabBar {...props} />}` — hoisted to a module constant so it is not
reallocated per render.

**RNTL v14 is async.** `render`, `renderHook`, `act`, `rerender` and `unmount` all return
promises. A missing `await` does not throw; `screen` reports "render function has not been
called" and `renderHook`'s `result` is `undefined`, which reads like a broken component rather
than a missing keyword.

**`SafeAreaProvider` renders `null` under the test renderer.** It waits for a native layout
event that never arrives, so anything below it never mounts. Mock the module per test file —
spread `jest.requireActual` so the contexts `@react-navigation/elements` needs survive — and
type the call as `jest.requireActual<typeof SafeAreaContext>(…)`, importing the namespace as a
type, since bare `requireActual` returns `any` and an inline `import()` type annotation is
banned by `consistent-type-imports`.
