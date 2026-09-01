/**
 * Public surface of the task entity. External code imports `@entities/task` and never
 * a nested file — `./model` holds the domain shape, its wire mapper and its service,
 * `./lib` holds the pure domain rules.
 */
export * from './lib';
export * from './model';
