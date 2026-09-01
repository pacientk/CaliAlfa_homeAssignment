export interface IDeleteTaskDialogProps {
  readonly isVisible: boolean;
  /** Named in the copy, so the modal cannot be answered without knowing what it is about. */
  readonly taskTitle: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}
