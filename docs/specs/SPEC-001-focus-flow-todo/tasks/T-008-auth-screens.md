# T-008: Welcome, phone, and verification screens

## Meta

| Field         | Value                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Type          | feature                                                                                                              |
| Size          | M                                                                                                                    |
| Risk          | medium                                                                                                               |
| Status        | not-started                                                                                                          |
| Languages     | TS                                                                                                                   |
| Scope paths   | `src/screens/Welcome/**`, `src/screens/PhoneNumber/**`, `src/screens/VerificationCode/**`, `src/features/auth/ui/**` |
| Blocked by    | T-007                                                                                                                |
| Blocks        | —                                                                                                                    |
| Epic sections | §9.1 A1–A5                                                                                                           |

## Goal

Build the three authentication screens to match artboards A1 to A5, including all three OTP
states.

## Scope

- **Welcome** — badge, headline, sub-copy, the geometric task-stack illustration built from
  themed shapes, three benefit rows, primary Next, and the "Already have an account? Log in"
  line that leads to the same phone screen.
- **Phone number** — country prefix and national number in one field, the reassurance line,
  primary Next disabled until the number is plausible.
- **Verification code** — six single-character boxes, a resend action behind a countdown, and
  the three states: empty with the first box focused, filled and valid, and error with the
  boxes in the error palette and the message under the row.

## Out of scope

- Auth logic — it comes from T-007's service and store.
- A separate login screen. Registration and login are the same flow by decision.

## Technical specification

### Files

One package folder per screen with the screen component, its styles factory, and its tests.
Shared pieces — the OTP box row, the countdown hook — live under `src/features/auth/ui/` and
`src/features/auth/hooks/`.

### Behaviour

- The phone field accepts digits, spaces, and a leading `+`, and normalises to E.164 before
  calling the service. Plausibility, not validity, gates the button: a full validation library
  is out of proportion here.
- The OTP row moves focus forward on entry and backward on delete, and accepts a pasted
  six-digit code by distributing it across the boxes.
- The countdown starts at 60 seconds when a code is sent and re-arms on resend.
- Every `AuthFailure` kind from T-007 has a distinct message in `strings.ts`.

## Acceptance criteria

- **AC-1** — Given the phone screen, when the field is empty or implausible, then Next is
  disabled; when it holds a plausible number, then Next is enabled.
- **AC-2** — Given the OTP screen after a code is sent, when fewer than six digits are
  entered, then Next is disabled and the countdown is visible; when six are entered, then Next
  is enabled.
- **AC-3** — Given a wrong code, when it is submitted, then the boxes render in the error
  palette, the message appears under the row, and the entered digits remain so the user can
  correct them rather than retype.
- **AC-4** — Given the countdown reaches zero, when it does, then Resend becomes an active
  action.

## Tests

**Strategy** — component tests with a mocked auth service. The visual match against the
artboards is manual.

**Core scenarios**

- **S-1** — Next disabled then enabled as the phone number becomes plausible — covers AC-1
  with its negative case
- **S-2** — six digits enable Next; five do not — covers AC-2
- **S-3** — an error response renders the error state and preserves the digits — covers AC-3
- **S-4** — the countdown gates Resend and releases it at zero — covers AC-4

**Manual verification**

- [ ] Each screen compared side by side with artboards A1–A5
- [ ] The full sign-in with the test number on the simulator

## References

- Epic §9.1
- Artboards A1–A5 in `Tech Assignment/design/`
- Cross-task interface: `T-007 §Service contract → AuthService, AuthFailure`
