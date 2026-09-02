/**
 * How long a category name this app will let someone type.
 *
 * A category is a chip in a row of chips, and a chip that wraps stops being a chip. Ten
 * characters is what the row holds at the design's `chipLabel` size without the row becoming
 * a paragraph.
 *
 * Like the title rules in `validateTitle`, this constrains what this app **creates**. It does
 * not retroactively invalidate what the server already holds: the seed data carries
 * "Administrator" and "Orchestrator", and those rows still render and are still selectable.
 * Truncating them on read would be corrupting data to satisfy a UI rule.
 */
export const CATEGORY_MAX_LENGTH = 10;
