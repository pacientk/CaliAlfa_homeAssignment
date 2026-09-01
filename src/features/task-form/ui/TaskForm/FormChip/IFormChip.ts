export interface IFormChipProps {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onPress: () => void;
  readonly testID?: string;
}
