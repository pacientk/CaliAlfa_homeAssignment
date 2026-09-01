export interface ITaskListScreenProps {
  readonly onCreateTask: () => void;
  /** The list owns the task identity; the navigator only knows how to open one. */
  readonly onOpenTask: (taskId: string) => void;
}
