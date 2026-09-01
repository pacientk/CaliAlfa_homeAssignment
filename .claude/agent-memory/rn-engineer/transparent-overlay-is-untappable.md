---
name: transparent-overlay-is-untappable
description: An opacity-0 view is invisible to UIKit hit-testing, so an overlaid input never takes focus on the device — and no unit test catches it
metadata:
  type: reference
---

A `TextInput` stretched over a custom control and hidden with `opacity: 0` — the standard way
to build an OTP row out of six drawn boxes and one real field — cannot be tapped on iOS.
`UIView.hitTest:withEvent:` returns `nil` for any view whose alpha is below `0.01`, so the tap
lands on nothing and the field never takes focus. Use a small non-zero opacity (`0.02`) with a
comment saying why.

**Why:** nothing in the test suite can see this. React Native Testing Library resolves queries
against the element tree and deliberately does _not_ treat `opacity: 0` as hidden (its
`accessibility.js` says so in a comment, because iOS still exposes transparent views to
VoiceOver). So every assertion about typing into the field passes, the resolved-style
assertions pass, and the screen is dead on the device. It is a pure "green tests are mechanics,
not UX" failure — found only by tapping the row on a simulator.

**How to apply:** whenever a control is hidden behind another one and driven by touch, the
simulator walk is the only gate that covers it. And prefer `opacity` over an off-screen
position for a hidden-but-live input: moving it away also moves the touch target, and VoiceOver
follows the visual order.
