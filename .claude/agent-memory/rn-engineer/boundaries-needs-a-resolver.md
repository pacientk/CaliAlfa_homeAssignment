---
name: boundaries-needs-a-resolver
description: eslint-plugin-boundaries silently enforces nothing without an import/resolver setting
metadata:
  type: feedback
---

`boundaries/element-types` can only judge a dependency it can resolve to a file. With no
`settings['import/resolver']`, every import is classified as unknown and the rule never
reports — a layer boundary that looks configured and enforces nothing.

**Why:** the default node resolver does not know `.ts`/`.tsx` extensions and cannot read
tsconfig `paths`, so both relative _and_ aliased cross-layer imports pass. Nothing in the lint
output says so; the rule simply stays quiet.

**How to apply:** configure the resolver and then prove the rule fires — write a deliberate
upward import and a deliberate cross-feature import, confirm ESLint exits non-zero on each,
confirm a legal downward import exits 0, then delete the scratch files. Reading "0 errors"
after adding the rule is not evidence it works; only a failing violation is.

```js
'import/resolver': {
  typescript: { project: './tsconfig.json' },
  node: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'] },
},
```
