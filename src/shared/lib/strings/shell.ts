/**
 * The app shell: tab labels and the two secondary tabs.
 *
 * The copy is split by area so that work on different screens does not contend on a
 * single file. `./index.ts` composes the areas back into one frozen `strings` object,
 * which is what every component reads.
 */

/** The bottom tab bar. Labels are drawn by `TabBar`, not by the screens themselves. */
export const tabs = {
  tasks: 'Tasks',
  calendar: 'Calendar',
  settings: 'Settings',
} as const;

/** Artboard C1 — the calendar tab, which is a coming-soon state and nothing else. */
export const calendar = {
  /** The navigation bar. */
  title: 'Calendar',
  /** The eyebrow badge at the top of the screen. */
  badge: 'COMING SOON',
  heading: 'Tasks by date, soon',
  /** The outline action back to the list. The tab bar can do this too; the button is the canvas's affordance. */
  backToTasks: 'Back to tasks',
  /** The line under the heading that says what "soon" means and where the tasks are today. */
  subtitle:
    "We're building a month view that lays tasks out by expiry date. Until then, everything lives in your list.",
  /**
   * The column letters on the decorative month grid, Monday first as the canvas draws them.
   * They are user-facing text like any other, so they live here rather than in the component.
   */
  weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
} as const;

/**
 * Artboard C2 — the settings tab. Signing out is the only live control; the preference rows
 * are drawn dimmed with a value or a "Soon" tag, so nothing looks tappable that is not.
 */
export const settings = {
  /** The navigation bar. */
  title: 'Settings',
  account: {
    /**
     * Shown in place of the number when the session carries none. Firebase always reports one
     * for a phone sign-in, so this is the honest answer to a state that should not occur
     * rather than a second design.
     */
    unknownPhone: 'Number unavailable',
    device: 'Signed in on this device',
  },
  preferences: {
    heading: 'PREFERENCES',
    notifications: 'Notifications',
    /** The tag on a preference that is drawn but not built. */
    soon: 'Soon',
    appearance: 'Appearance',
    /** The app ships one light theme, so the value is a statement rather than a choice. */
    appearanceValue: 'Light',
    about: 'About Focus & Flow',
    aboutValue: '1.0',
  },
  signOut: 'Log out',
  signOutNote: "You'll need the SMS code again to sign back in.",
} as const;
