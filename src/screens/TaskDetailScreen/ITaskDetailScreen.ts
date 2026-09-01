export interface ITaskDetailScreenProps {
  /** The task being viewed. The navigator reads it off the route and hands it over. */
  readonly taskId: string;
  readonly onClose: () => void;
}
