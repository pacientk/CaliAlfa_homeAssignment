---
name: firebase-phone-auth-on-a-simulator
description: A Firebase test phone number still hits reCAPTCHA on iOS unless app verification is disabled for testing
metadata:
  type: reference
---

A phone number whitelisted in the Firebase console still diverts to the reCAPTCHA web flow
on iOS when the project has no APNs auth key. `getAuth().settings.appVerificationDisabledForTesting = true`
before `signInWithPhoneNumber` is what makes the client skip app verification; with it, the
whitelisted number and its fixed code sign in immediately.

**Why:** the iOS SDK attempts APNs silent-push device verification _before_ it tells the
server which number is being signed in, so it cannot know the number is a test number yet.
With no APNs key the push never arrives and the SDK opens `<project>.firebaseapp.com` in a
`SFSafariViewController` to run reCAPTCHA. The frequently-repeated claim that "test numbers
skip app verification entirely" is true of the server, not of the client.

**How to apply:** when phone sign-in on a simulator lands on a reCAPTCHA image challenge,
that is the diagnosis — not a wrong number, not a missing plist. Confirm it by toggling
`appVerificationDisabledForTesting` and re-running. Shipping the setting unconditionally
disables reCAPTCHA for every number and every user, so it is a product decision, not an
implementation detail: surface it rather than quietly enabling it.
