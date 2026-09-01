export interface IFieldLabelProps {
  readonly text: string;
  /** Appends the design's quieter " · optional" suffix — artboards B6 and B8. */
  readonly isOptional?: boolean;
}
