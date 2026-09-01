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

export const calendar = {
  title: 'Calendar',
  subtitle: 'Coming soon.',
} as const;

export const settings = {
  title: 'Settings',
  subtitle: 'Account and preferences land here.',
  signOut: 'Sign out',
} as const;
