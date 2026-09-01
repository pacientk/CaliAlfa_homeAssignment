import type { AccessibilityState, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

/**
 * Reading a rendered element's real props, for the auth screens' suites.
 *
 * `shared/ui/atoms/testing/renderWithTheme.ts` has the same idea, but its helpers are typed
 * for `react-test-renderer`'s `ReactTestInstance`, and React Native Testing Library v14's
 * queries return an instance of its own bundled renderer instead — the two are not assignable
 * to each other. So this is the RNTL-shaped equivalent, described structurally so that neither
 * renderer's type has to be imported into a test.
 */
interface RenderedElement {
  readonly props: Record<string, unknown>;
}

/**
 * One prop, under the type the caller declares.
 *
 * A rendered element's props are an index signature of `any`, which is exactly the shape the
 * project bans; funnelling every read through here means the one assertion happens in test
 * support rather than in every assertion in every suite.
 */
export const propOf = <TValue>(element: RenderedElement, name: string): TValue =>
  // The caller names the prop and therefore knows its type; the renderer cannot.
  element.props[name] as TValue;

/**
 * The element's style, flattened to the values that actually render.
 *
 * `verification-checklist.md § 2` and § 11 ask for the resolved value rather than the presence
 * of a style name: a component can carry the right style object and still paint the wrong
 * colour after a change to the factory, and only the flattened result catches that.
 */
export const styleOf = (element: RenderedElement): ViewStyle =>
  StyleSheet.flatten(propOf<StyleProp<ViewStyle>>(element, 'style'));

/** Whether the element announces itself as unavailable — the disabled half of a press gate. */
export const isDisabled = (element: RenderedElement): boolean =>
  propOf<AccessibilityState>(element, 'accessibilityState').disabled === true;
