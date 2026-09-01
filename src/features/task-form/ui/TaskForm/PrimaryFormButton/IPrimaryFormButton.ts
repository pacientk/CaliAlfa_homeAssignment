export interface IPrimaryFormButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  /** Artboard B7: an invalid title leaves the button drawn but inert. */
  readonly isDisabled: boolean;
  readonly testID?: string;
}
