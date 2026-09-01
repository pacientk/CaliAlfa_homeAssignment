# rn-engineer memory

- `metro-at-prefixed-aliases` — Metro cannot express `@`-prefixed aliases through
  `extraNodeModules`; use `resolver.resolveRequest`.
- `boundaries-needs-a-resolver` — `eslint-plugin-boundaries` enforces nothing without an
  `import/resolver` setting; prove the rule fires before trusting it.
- `react-navigation-tab-bar-and-rntl` — `tabBar` is a render callback; RNTL v14's
  `render`/`renderHook`/`act` are async; `SafeAreaProvider` needs a mock in tests.
