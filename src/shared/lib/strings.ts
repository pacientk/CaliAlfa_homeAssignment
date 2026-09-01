/**
 * Every user-facing string in the app, in one place.
 *
 * `docs/architecture/PROJECT-PROFILE.md` declares no localisation: the app is English-only
 * and there is no i18n library and no locale switching. The module exists anyway because the
 * seam is what matters — a component that reads `strings.welcome.title` instead of a literal
 * is a component that does not have to be rewritten the day a second locale arrives, and the
 * set of strings the product actually ships is readable in one file rather than grepped out
 * of thirty.
 *
 * Frozen at the top level and `as const` throughout, so a caller can neither reassign a group
 * nor widen a value to `string`.
 */
export const strings = Object.freeze({
  /** The bottom tab bar. Labels are drawn by `TabBar`, not by the screens themselves. */
  tabs: {
    tasks: 'Tasks',
    calendar: 'Calendar',
    settings: 'Settings',
  },

  welcome: {
    title: 'Focus & Flow',
    subtitle: 'Sign in to keep your tasks in sync.',
    continue: 'Get started',
  },

  phoneNumber: {
    title: 'Phone number',
    subtitle: 'We send a one-time code to confirm it is you.',
    submit: 'Send the code',
  },

  verificationCode: {
    title: 'Verification code',
    subtitle: 'Enter the six digits we just sent.',
    submit: 'Verify',
  },

  taskList: {
    title: 'Tasks',
    subtitle: 'Your tasks appear here.',
    createTask: 'New task',
    openTask: 'Open a task',
  },

  newTask: {
    title: 'New task',
    subtitle: 'The task form lands here.',
    close: 'Back to the list',
  },

  taskDetail: {
    title: 'Task detail',
    close: 'Back to the list',
  },

  calendar: {
    title: 'Calendar',
    subtitle: 'Coming soon.',
  },

  settings: {
    title: 'Settings',
    subtitle: 'Account and preferences land here.',
    signOut: 'Sign out',
  },
} as const);
