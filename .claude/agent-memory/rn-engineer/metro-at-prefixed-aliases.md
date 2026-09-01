---
name: metro-at-prefixed-aliases
description: Metro cannot express @-prefixed path aliases through extraNodeModules; use resolver.resolveRequest
metadata:
  type: reference
---

`resolver.extraNodeModules` does not map an alias whose key starts with `@`. Metro reads a
leading `@` as an npm scope, so `@ui/tokens` is looked up as the whole package name
`@ui/tokens` rather than as the prefix `@ui` plus a path, and the mapping never matches.

**Why:** the bundle then fails at the first cross-layer import with
`Unable to resolve module @ui/tokens`. Unit tests do not catch it — Jest resolves through
`moduleNameMapper` and TypeScript through tsconfig `paths`, so type-check and the whole suite
stay green while the app cannot start. The failure only appears the first time someone
launches it.

**How to apply:** put the alias map in `metro.config.js` and rewrite the specifier in
`resolver.resolveRequest` before delegating to `context.resolveRequest`. Match a prefix only
when it is followed by `/` or ends the specifier, so real scoped packages
(`@tanstack/react-query`, `@react-navigation/native`) fall through untouched.
