# Production readiness

The register of human steps that no agent can perform and that must happen before this app is
anything other than a simulator build. Every item below sits in a console, a developer portal, or
a service dashboard; none of them can be committed, and nothing in the type-check, lint, or test
gates fails if one is forgotten. That is exactly why they are written down here rather than
discovered on the day.

Two of these — APNs and the App Check enforcement it enables — are the reason the README's first
limitation exists. The rest are the ordinary cost of taking a phone-auth app off a simulator.

## Register

`Source` names the spec section that raised the item. `Blocking?` means the app does not
function for a real user without it, as opposed to being merely advisable.

| Item                                                                                                                                                                                                                                                                           | Source           | Owner  | Blocking? | Done |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------ | --------- | ---- |
| Create an APNs authentication key in the Apple Developer portal and upload it to Firebase Console → Project settings → Cloud Messaging → Apple app configuration for `todolist-b4a98`                                                                                          | SPEC-001 §23.1   | KirTer | yes       | [ ]  |
| Remove the `__DEV__` app-verification override once APNs is live, and confirm a real number completes sign-in on a physical device — the override disables reCAPTCHA for **every** number                                                                                      | SPEC-001 §23.1   | KirTer | yes       | [ ]  |
| Register the production bundle identifier in the Firebase iOS app and re-download `GoogleService-Info.plist` if it ever moves off `org.reactjs.native.example.CaliAlfa`                                                                                                        | SPEC-001 §11.2   | KirTer | yes       | [ ]  |
| Raise or confirm the Firebase phone-auth SMS quota for the expected sign-in volume, and set a billing alert — the free tier's daily cap is reached silently and returns `quotaExceeded`                                                                                        | SPEC-001 §7.3 G  | KirTer | yes       | [ ]  |
| Remove every entry under Firebase Console → Authentication → Sign-in method → Phone → Test phone numbers before any public release                                                                                                                                             | SPEC-001 §16.4   | KirTer | yes       | [ ]  |
| **Restrict or rotate the Firebase Web API key** in Google Cloud Console → Credentials, scoping it to the iOS bundle identifier. It was committed in `GoogleService-Info.plist` before that file was removed, so it must be treated as disclosed whatever the history now shows | SPEC-001 §16.4   | KirTer | yes       | [ ]  |
| Enable Firebase App Check with the App Attest provider and turn on enforcement for Authentication — this is the real defence the reCAPTCHA fallback is standing in for                                                                                                         | SPEC-001 §16.4   | KirTer | no        | [ ]  |
| Replace the mockapi.io resource with a backend that authenticates requests and carries an owner field per task, then scope the list to the signed-in user — the current API is shared by all                                                                                   | SPEC-001 §6, §13 | KirTer | yes       | [ ]  |
| Configure Firebase Authentication's authorised domains for the reCAPTCHA fallback, so the web-view challenge can return to the app on devices where App Attest is unavailable                                                                                                  | SPEC-001 §23.1   | KirTer | no        | [ ]  |
| Provide App Store privacy-nutrition answers declaring the phone number as collected data linked to identity, before the first submission                                                                                                                                       | SPEC-001 §16.4   | KirTer | yes       | [ ]  |

## Notes on the first two

They are one item split in two because they fail differently. Without the APNs key, sign-in on a
real device falls back to a reCAPTCHA web view, which works but is a poor experience and is not
what the flow was designed around. Without removing the `__DEV__` override, a release build that
somehow kept it would accept **any** number without app verification, which is an abuse vector
rather than an inconvenience. The override is gated on `__DEV__` precisely so that the second
failure cannot reach a release build by accident — but the gate is a safety net, not a substitute
for deleting the line once it is no longer needed.

## What is deliberately not here

- **Deferred engineering work** — that is `docs/future-work.md`. An item belongs here only if a
  human outside the repository has to do it.
- **Feature flags, migrations, staged rollout** — none exist. Per epic §19 the deliverable is a
  repository and a simulator build, so there is no deployment pipeline to gate.
