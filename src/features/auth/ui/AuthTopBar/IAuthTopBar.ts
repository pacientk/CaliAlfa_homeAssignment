export interface IAuthTopBarProps {
  readonly onBack: () => void;
  /** The glyph announces nothing on its own, so the caller names the action. */
  readonly accessibilityLabel: string;
  readonly testID?: string;
}
