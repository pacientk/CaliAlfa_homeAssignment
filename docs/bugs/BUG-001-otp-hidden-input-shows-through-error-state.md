# BUG-001 — The OTP field's hidden input shows through in the error state

## Meta

| Field               | Value                                                                              |
| ------------------- | ---------------------------------------------------------------------------------- |
| ID                  | `BUG-001`                                                                          |
| Title               | `The OTP field's hidden input shows through in the error state`                    |
| Slug                | `otp-hidden-input-shows-through-error-state`                                       |
| Severity            | `low`                                                                              |
| Discovered          | `2026-09-02`                                                                       |
| Discovered during   | `SPEC-001, T-013-delivery` (the §18.4 manual pass, on the iPhone 16 Pro simulator) |
| Status              | `open`                                                                             |
| Originating SPEC    | `SPEC-001 §9.1` (artboard A5, the verification-code error state) and `§9.3`        |
| Suggested fix track | `hotfix`                                                                           |

## Component

- **File path(s):** `src/features/auth/ui/OtpCodeRow/OtpCodeRow.styles.ts` — the `field`
  style and the `HIT_TESTABLE_OPACITY` constant it uses;
  `src/features/auth/ui/OtpCodeRow/OtpCodeRow.tsx` — the component that stretches that
  field over the six boxes.
- **Package(s):** `@features/auth/ui/OtpCodeRow`.
- **Feature area:** auth — the verification-code screen.

## Repro

Reproducible from a clean checkout; no fixture depends on any particular server row.

1. `nvm use && npm ci && bundle install && bundle exec pod install --project-directory=ios`
2. `npm run ios`
3. Sign out if a session is restored, then walk Welcome → **Next** → phone number
   `+972 52-828-7009` → **Next**.
4. Type any six digits that are **not** `123456` — `111111` is the clearest, because six
   identical glyphs make the artefact easy to see — and press **Next**.
5. Wait for the error state to render, then look at the **first** box.

Observed on iPhone 16 Pro, iOS 18.0 simulator, Debug build, twice in two independent
sessions (screenshots `73-A5-otp-error.png` and its crop, taken during T-013).

There is no failing automated test: the defect is a rendered colour relationship, which is
not something React Native Testing Library can observe. See **Test status**.

## Expected vs actual

**Expected** (per `SPEC-001 §9.1`, artboard A5): the error state draws six boxes filled
with the error container colour, each carrying exactly one digit, plus the inline message.
The text input that actually captures the code is a mechanism, not a mark, and must not be
visible in any state.

**Actual:** the whole six-character string the user typed is faintly legible behind the
first box's digit, as a pale ghost. Everything else on the artboard is correct — the icon
tile, the six fills and borders, the message, the resend affordance.

## Evidence

`OtpCodeRow.styles.ts` holds the real input at a deliberately non-zero opacity, and the
comment states the contrast maths it was chosen against:

```ts
/**
 * Invisible, but only just — and that is the point.
 *
 * `UIView.hitTest:withEvent:` refuses to return a view whose alpha is below 0.01, so a field
 * at `opacity: 0` is a field the user cannot tap ... Two hundredths is above UIKit's floor and
 * below anything an eye resolves — the text it draws is `#1c1a23` at 2% on a white box, which
 * is `#fafafa`.
 */
const HIT_TESTABLE_OPACITY = 0.02;
```

The reasoning is right and the constant is right for the case it names. The gap is that the
box is only white in the resting and focused states. `boxError` fills it with
`theme.colors.feedback.errorContainer` — a pale red — and the same 2% of near-black over
that fill lands far enough from the fill to be perceptible. The artefact therefore appears
in exactly one state, which is why the three A3/A4/A5 render tests and the earlier manual
passes did not catch it.

## Test status

`n/a — surfaced via manual verification`. No test is skipped and no test is annotated with
this bug's token, so the repo-wide `grep -rEn 'blocked by BUG-[0-9]+' .` reconciliation
stays empty and correct. A regression guard for this defect would have to assert a rendered
colour relationship between two overlapping views, which RNTL cannot see; the honest guard
is a snapshot of the three box states in a screenshot-diffing harness, and that harness does
not exist in this project.

## Recommendation

`hotfix`. The fix is small and isolated: give the field's text colour the same treatment the
box already gets, so the ghost is tinted to whichever fill sits under it rather than being
one fixed near-black. Concretely, drive the input's `color` from the box state — error fill
gets the error container colour, resting and focused keep the current value — which keeps
the 2% opacity that makes the field hit-testable while removing the only case where 2% is
visible. It is a one-file change and it needs a look on the device, not a new test.

## Resolution (filled when status flips to `closed`)
