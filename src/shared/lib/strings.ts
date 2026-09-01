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

  /**
   * Artboards B1–B5. Anything that names a task or counts one is a function rather than a
   * literal: interpolation is the one place a copy change silently becomes a code change, so
   * the sentence and its holes stay together in this file instead of being assembled at the
   * call site.
   */
  taskList: {
    /** The centred navigation title. FR-26: no back button, no search icon. */
    title: 'To-do',

    momentum: {
      title: "Today's momentum",
      progress: (completedCount: number, totalCount: number): string =>
        `${completedCount} of ${totalCount} ${totalCount === 1 ? 'task' : 'tasks'} completed`,
      /** Replaces the count line while the list is empty — artboard B4. */
      empty: 'Nothing on the list yet',
      /** Read out in place of the bar, which carries no text of its own. */
      progressLabel: (completedCount: number, totalCount: number): string =>
        `${completedCount} of ${totalCount} completed`,
    },

    /** Decorative, and labelled as such on sheet D. It reports no state. */
    focusMode: 'Focus Mode Active',

    proTip: {
      label: 'PRO TIP',
      body: 'Group tasks by mental energy, not by deadline.',
    },

    search: {
      label: 'Search tasks',
      placeholder: 'Search tasks…',
      clear: 'Clear search',
    },

    createTask: 'New task',

    row: {
      /** The checkbox announces the task it belongs to; the state comes from the role. */
      toggleDone: (title: string): string => title,
      toggleDoneHint: 'Marks the task complete.',
      expiredHint: 'This task has expired and can no longer be completed.',
      actions: (title: string): string => `Actions for ${title}`,
      edit: 'Edit',
      delete: 'Delete',
    },

    /** Artboard B4 — nothing has ever been added. */
    noTasks: {
      title: 'Your list is clear',
      message: 'Add the first task and it will show up here.',
    },

    /** Artboard B5 — deliberately different copy, icon, and action from B4. */
    noResults: {
      title: (query: string): string => `No match for \u201C${query}\u201D`,
      message: (hiddenCount: number): string =>
        hiddenCount === 1
          ? '1 task is hidden by this search.'
          : `${hiddenCount} tasks are hidden by this search.`,
    },

    /** Artboard B3. The task is named, so the modal cannot be answered by accident. */
    deleteDialog: {
      title: 'Delete task?',
      message: (title: string): string =>
        `\u201C${title}\u201D will be removed permanently. This can't be undone.`,
      cancel: 'Cancel',
      confirm: 'Delete',
    },
  },

  /**
   * The banner on sheet D, "OFFLINE / SYNCING BANNER". `syncStore.lastError` is a failure
   * *kind*, so the wording is chosen from the kind here rather than assembled in the store —
   * which is what keeps user-facing copy out of the state layer.
   */
  syncBanner: {
    offline: 'Offline — changes will sync later',
    pending: (pendingCount: number): string =>
      pendingCount === 1 ? 'Syncing 1 change…' : `Syncing ${pendingCount} changes…`,
    error: {
      offline: 'Offline — changes will sync later',
      transport: "We couldn't reach the server. Your changes are still here.",
      server: 'The server had a problem. Your changes are still here.',
      notFound: 'That task is no longer on the server.',
      client: 'The server rejected a change.',
    },
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
