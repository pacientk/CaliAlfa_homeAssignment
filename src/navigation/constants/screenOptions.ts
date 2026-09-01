/**
 * Shared by all three navigators. Every screen in the design draws its own header — the
 * welcome hero, the task list's title row, the form's back arrow — so React Navigation's
 * header is off everywhere rather than styled into invisibility screen by screen.
 *
 * A module constant rather than an inline literal so the navigators do not allocate a fresh
 * options object on every render.
 */
export const HIDDEN_HEADER = { headerShown: false } as const;
