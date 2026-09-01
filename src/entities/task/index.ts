/**
 * Public surface of the task entity. External code imports `@entities/task` and never
 * a nested file — `./model` holds the domain shape, its wire mapper and its service,
 * `./lib` holds the pure domain rules, and `./ui` holds the components that draw a task.
 */
export * from './lib';
export * from './model';
export * from './ui';
