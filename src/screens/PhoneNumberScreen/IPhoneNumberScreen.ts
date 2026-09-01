export interface IPhoneNumberScreenProps {
  /** Fires when a plausible number has been entered and the code should be sent. */
  readonly onSubmit: () => void;
}
