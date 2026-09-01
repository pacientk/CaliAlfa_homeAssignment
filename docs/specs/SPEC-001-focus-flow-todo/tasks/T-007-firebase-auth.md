# T-007: Firebase phone authentication

## Meta

| Field         | Value                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Type          | feature                                                                                             |
| Size          | M                                                                                                   |
| Risk          | high                                                                                                |
| Status        | not-started                                                                                         |
| Languages     | TS                                                                                                  |
| Scope paths   | `src/features/auth/**`, `src/shared/store/session*`, `ios/CaliAlfa/**`, `ios/CaliAlfa.xcodeproj/**` |
| Blocked by    | T-003                                                                                               |
| Blocks        | T-008, T-012                                                                                        |
| Epic sections | §7.3 G, §16.4, §23.1                                                                                |

## Goal

Wire Firebase phone authentication end to end and expose it as a feature with a session
store, verified by actually signing in on the simulator.

## Context

This is the highest-risk task in the spec: it is the only one that depends on native
configuration, an external provider, and a simulator quirk at the same time. It is scheduled
early for that reason — discovering an auth problem on the last evening is the failure mode to
avoid.

## Scope

- `GoogleService-Info.plist` added to the iOS target and committed.
- Firebase initialised at native startup.
- `sendVerificationCode(phone)` and `confirmCode(code)` behind a typed service.
- A session store: signed-in flag, the user's phone number, initialising flag.
- Session restoration on cold start via the Firebase auth state listener.
- Sign-out.
- Error mapping for wrong code, expired code, quota exceeded, and network failure.

## Out of scope

- Screens — T-008.
- Any per-user data scoping. The API has no owner field; see epic §6.

## Technical specification

### Native configuration

`GoogleService-Info.plist` is added to the `CaliAlfa` target's resources — dragging it into
the folder is not enough; it must appear in the target's Copy Bundle Resources phase or
Firebase will not find it at runtime. The bundle identifier must stay
`org.reactjs.native.example.CaliAlfa`, which is what the plist declares.

The plist also carries a `REVERSED_CLIENT_ID`. Register it as a URL scheme so the reCAPTCHA
fallback has somewhere to return to, even though the test number should never reach that path.

### The simulator constraint, stated plainly

There is no APNs auth key for this project, so Firebase cannot perform silent-push device
verification. Real phone numbers therefore cannot complete sign-in here. Firebase **test**
phone numbers skip app verification entirely, which is why `+972 52-828-7009` with code
`123456` works on a simulator with no APNs key. This is a limitation of the environment, not
of the implementation, and it goes in the README rather than being quietly worked around.

### Service contract

```ts
interface AuthService {
  sendVerificationCode(e164Phone: string): Promise<ConfirmationHandle>;
  confirmCode(handle: ConfirmationHandle, code: string): Promise<void>;
  signOut(): Promise<void>;
  observeSession(listener: (phone: string | undefined) => void): () => void;
}

type AuthFailure =
  | { kind: 'invalidCode' }
  | { kind: 'expiredCode' }
  | { kind: 'quotaExceeded' }
  | { kind: 'invalidPhone' }
  | { kind: 'network' }
  | { kind: 'unknown'; cause: unknown };
```

Firebase error codes map onto `AuthFailure` in one place; no component ever sees a raw
Firebase error.

## Acceptance criteria

- **AC-1** — Given a clean install on the simulator, when the test number and code are
  entered, then the session store reports signed-in and the phone number.
- **AC-2** — Given a signed-in session, when the app is killed and relaunched, then the
  session is restored without any user interaction.
- **AC-3** — Given sign-out, when it completes, then the session store reports signed-out and
  a relaunch does not restore it.
- **AC-4** — Given each Firebase error code the flow can produce, when it is mapped, then the
  matching `AuthFailure` kind results, and an unrecognised code maps to `unknown` rather than
  being swallowed.
- **AC-5** — Given no network, when a code is requested, then the failure is `network` and the
  user is told sign-in needs a connection.

## Tests

**Strategy** — unit tests over the error mapper and the session store against a mocked
Firebase module. The sign-in itself is verified manually: mocking the provider that IS the
unit under test would prove nothing (VR-11).

**Core scenarios**

- **S-1** — every known Firebase error code maps to its kind; an unknown code maps to
  `unknown` — covers AC-4 with its negative case
- **S-2** — the auth-state listener drives the session store in both directions — covers
  AC-2, AC-3
- **S-3** — a network rejection produces `network` — covers AC-5

**Manual verification** — this task is not complete until these pass on a device:

- [ ] Sign in with the test number on a clean install
- [ ] Kill and relaunch — still signed in
- [ ] Sign out, relaunch — signed out
- [ ] Airplane mode: requesting a code gives the network message, not a crash

## References

- Epic §7.3 G, §16.4, §23.1
- Config: `Tech Assignment/GoogleService-Info.plist`, project `todolist-b4a98`
- Test credentials: `+972 52-828-7009` / `123456`

## Additional scenarios discovered during implementation

- **S-4 — a configured test number still hits reCAPTCHA on iOS.** The task assumed a
  Firebase test phone number "skips app verification entirely". That is true of the
  _server_, not of the iOS client: the SDK attempts APNs silent-push verification before it
  ever tells the server which number is being signed in, and with no APNs key it falls back
  to opening the reCAPTCHA web flow. `+972 52-828-7009` reaches that fallback. Setting
  `getAuth().settings.appVerificationDisabledForTesting = true` before
  `signInWithPhoneNumber` is what makes the client skip app verification, after which the
  documented number and code sign in immediately. Verified both ways on the simulator; the
  decision about whether that setting ships is recorded in the T-007 hand-off.
- **S-5 — sign-out is optimistic.** The store clears the local session before the provider
  call resolves, so the user is not made to watch a spinner for a local operation. The auth
  listener re-asserts the same state immediately afterwards, so the two cannot drift. A
  provider rejection is reported rather than swallowed, because a provider that refused to
  clear its own state would otherwise resurface as a session that returns after a relaunch.
- **S-6 — the store is subscribed at import, not from a provider component.** The session is
  a process-lifetime fact and the listener has to be running before the first render, so
  `sessionStore.ts` subscribes at module scope. `src/app/` is not in this task's scope and
  needs no change for session restoration to work.
- **Blocked elsewhere — `RootNavigator` does not yet consume `isInitialising`.** The flag is
  implemented and tested, but the navigator switches on `useIsSignedIn()` alone, so a
  returning user can still see one frame of the welcome screen. Wiring it is T-008/T-012
  work; the store's surface is ready for it.
