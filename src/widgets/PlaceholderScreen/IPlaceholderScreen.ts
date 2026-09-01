/** One tappable action under the title. The label doubles as the accessibility label. */
export interface PlaceholderAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface IPlaceholderScreenProps {
  readonly title: string;
  /** A line of explanatory copy under the title. */
  readonly subtitle?: string;
  /** Omitted means a screen with no way out of it — Calendar, for instance. */
  readonly actions?: readonly PlaceholderAction[];
}
