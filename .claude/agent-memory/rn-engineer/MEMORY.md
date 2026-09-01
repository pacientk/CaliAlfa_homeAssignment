# rn-engineer memory

- `metro-at-prefixed-aliases` — Metro cannot express `@`-prefixed aliases through
  `extraNodeModules`; use `resolver.resolveRequest`.
- `boundaries-needs-a-resolver` — `eslint-plugin-boundaries` enforces nothing without an
  `import/resolver` setting; prove the rule fires before trusting it.
- `react-navigation-tab-bar-and-rntl` — `tabBar` is a render callback; RNTL v14's
  `render`/`renderHook`/`act` are async; `SafeAreaProvider` needs a mock in tests.
- `firebase-phone-auth-on-a-simulator` — a whitelisted test number still hits reCAPTCHA on
  iOS without an APNs key; `appVerificationDisabledForTesting` is the switch.
- `react-native-firebase-under-jest` — importing the SDK is fatal under Jest; fix it once
  with a root `__mocks__` entry and add `__mocks__` to the tsconfig `include`.
