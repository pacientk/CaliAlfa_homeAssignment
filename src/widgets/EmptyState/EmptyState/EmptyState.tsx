import { AppIcon, AppPressable, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import type { TextStyle } from 'react-native';

import type { EmptyStateStyles } from './EmptyState.styles';
import { makeEmptyStateStyles } from './EmptyState.styles';
import type { EmptyStateTone, IEmptyStateProps } from './IEmptyState';

const BRAND: EmptyStateTone = 'brand';

/** The neutral tile's glyph is the tertiary text role; the brand tile's is a surface colour. */
const resolveGlyphStyle = (
  styles: EmptyStateStyles,
  tone: EmptyStateTone,
): TextStyle | undefined => (tone === BRAND ? styles.glyphBrand : undefined);

/**
 * A tile, a headline, a line of copy, and one way forward.
 *
 * It is one component with a tone rather than two look-alikes because the *difference* is
 * what the design is making a point of: B4 and B5 are drawn side by side precisely so the
 * user can tell "there is nothing" from "your search hid everything" at a glance, and holding
 * both in one file is what keeps that contrast visible to whoever changes either.
 */
export const EmptyState = ({
  icon,
  tone,
  title,
  message,
  actionLabel,
  onAction,
  actionIcon,
  isCentred,
  testID,
}: IEmptyStateProps): JSX.Element => {
  const styles = useThemedStyles(makeEmptyStateStyles);
  const isBrand = tone === BRAND;

  return (
    <AppView
      style={[styles.container, isCentred ? styles.containerCentred : styles.containerAnchored]}
      testID={testID}
    >
      <AppView style={[styles.tile, isBrand ? styles.tileBrand : styles.tileNeutral]}>
        <AppIcon
          name={icon}
          size="size30"
          color="tertiary"
          style={resolveGlyphStyle(styles, tone)}
        />
      </AppView>

      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="body" color="secondary" style={styles.message}>
        {message}
      </AppText>

      <AppPressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        style={[styles.action, isBrand ? styles.actionBrand : styles.actionNeutral]}
        testID={testID === undefined ? undefined : `${testID}.action`}
      >
        {actionIcon === undefined ? null : (
          <AppIcon name={actionIcon} size="size20" color={isBrand ? 'onPrimary' : 'accent'} />
        )}
        <AppText variant="label" color={isBrand ? 'onPrimary' : 'accent'}>
          {actionLabel}
        </AppText>
      </AppPressable>
    </AppView>
  );
};
