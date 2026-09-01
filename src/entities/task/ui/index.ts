/**
 * Display components bound to the task entity. `docs/architecture/principles.md § Where an
 * extracted component goes` puts a component that renders a domain record here rather than in
 * a feature: the row is what a task *looks like*, and the list screen, the detail screen and
 * anything later that shows a task all draw the same one.
 */
export * from './TaskRow';
