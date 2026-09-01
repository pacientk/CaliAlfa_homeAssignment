/**
 * The screen states what it needs done, not where it goes. Route names live in
 * `src/navigation/`, which sits *above* this layer, so a screen that imported them would
 * invert the FSD dependency the epic draws in §11.1 — the navigator wires this callback to
 * a route instead.
 */
export interface IWelcomeScreenProps {
  readonly onContinue: () => void;
}
