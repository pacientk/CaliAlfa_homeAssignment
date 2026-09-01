/**
 * The screen states what it needs done, not where it goes. Route names live in
 * `src/navigation/`, which sits *above* this layer, so a screen that imported them would
 * invert the FSD dependency the epic draws in §11.1 — the navigator wires these callbacks to
 * routes instead.
 */
export interface IPhoneNumberScreenProps {
  readonly onBack: () => void;
  /**
   * Fires once the provider has accepted the number and a code is on its way. The number and
   * the provider's handle are not passed with it: they go into the auth feature's own store,
   * because a `ConfirmationHandle` holds a function and navigation state must stay
   * serialisable.
   */
  readonly onCodeSent: () => void;
}
