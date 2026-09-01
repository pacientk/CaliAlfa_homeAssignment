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

import * as auth from './auth';
import * as shell from './shell';
import * as taskForm from './taskForm';
import * as taskList from './taskList';

export const strings = Object.freeze({
  ...shell,
  ...auth,
  ...taskList,
  ...taskForm,
} as const);
