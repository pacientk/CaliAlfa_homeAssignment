/**
 * Every screen name in the app. `docs/architecture/coding-rules.md § Route names via
 * constants` bans the string literal at the call site: a typo in `navigate('TaskLst')` is a
 * runtime no-op, while a typo here is a type error.
 *
 * The values are the names React Navigation registers, so they are also what appears in a
 * navigation state dump — they stay human-readable rather than becoming opaque ids.
 */
export const ROUTES = {
  WELCOME: 'Welcome',
  PHONE_NUMBER: 'PhoneNumber',
  VERIFICATION_CODE: 'VerificationCode',
  MAIN_TABS: 'MainTabs',
  TASK_LIST: 'TaskList',
  NEW_TASK: 'NewTask',
  TASK_DETAIL: 'TaskDetail',
  CALENDAR: 'Calendar',
  SETTINGS: 'Settings',
} as const;
