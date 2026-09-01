# T-012: Calendar placeholder and Settings

## Meta

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Type          | feature                                              |
| Size          | S                                                    |
| Risk          | low                                                  |
| Status        | not-started                                          |
| Languages     | TS                                                   |
| Scope paths   | `src/screens/Calendar/**`, `src/screens/Settings/**` |
| Blocked by    | T-007                                                |
| Blocks        | —                                                    |
| Epic sections | §9.1 C1–C2, §8 FR-3, FR-25                           |

## Goal

Build the two secondary tabs so the shell is complete rather than half-wired.

## Scope

- **Calendar** — a deliberate "Coming soon" placeholder matching artboard C1. It should read
  as an intentional state, not as an unfinished screen.
- **Settings** — the signed-in phone number and a sign-out action, matching artboard C2.

## Out of scope

- Any calendar functionality. The tab is a placeholder by explicit instruction.
- Account deletion, notification settings, theme switching. None are in scope.

## Technical specification

Sign-out calls the auth service from T-007 and clears the session store. The navigator's
session switch does the rest — Settings does not navigate manually, because two things
deciding where the user goes is how you get a screen that survives sign-out.

The locally cached tasks are **not** cleared on sign-out. The API is single-tenant by
construction (epic §6), so there is no second user whose data could leak, and keeping the
cache means the next sign-in renders instantly. This is a decision, not an omission, and it
belongs in the README.

## Acceptance criteria

- **AC-1** — Given the Calendar tab, when it renders, then the coming-soon state matches C1.
- **AC-2** — Given the Settings tab, when it renders, then the signed-in phone number is shown.
- **AC-3** — Given sign-out, when it is tapped, then the app returns to the welcome screen and
  a relaunch does not restore the session.

## Tests

**Strategy** — component tests with a mocked auth service.

**Core scenarios**

- **S-1** — Calendar renders its placeholder — covers AC-1
- **S-2** — Settings shows the number from the session store — covers AC-2
- **S-3** — sign-out calls the service and clears the store — covers AC-3

**Manual verification**

- [ ] C1 and C2 compared with the artboards
- [ ] Sign out, relaunch, confirm the welcome screen

## References

- Epic §9.1, §8
- Artboards C1–C2 in `Tech Assignment/design/`
