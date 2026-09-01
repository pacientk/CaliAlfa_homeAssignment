import type { Theme } from '@ui/tokens';
import type { TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

export interface EmptyStateStyles {
  readonly container: ViewStyle;
  readonly containerCentred: ViewStyle;
  readonly containerAnchored: ViewStyle;
  readonly tile: ViewStyle;
  readonly tileBrand: ViewStyle;
  readonly tileNeutral: ViewStyle;
  readonly glyphBrand: TextStyle;
  readonly title: TextStyle;
  readonly message: TextStyle;
  readonly action: ViewStyle;
  readonly actionBrand: ViewStyle;
  readonly actionNeutral: ViewStyle;
}

/** Sheet D's secondary button carries a 1 pt brand edge; a border width stays structural. */
const OUTLINE_BORDER_WIDTH = 1;

/**
 * Artboards B4 and B5. The 64 pt tile, the 24 pt title 12 pt under it, the copy, and a 48 pt
 * pill 16 pt further down.
 *
 * The message's measure is drawn as `max-width: 280` on a 362 pt content column. It is
 * expressed here as the 40 pt macro-whitespace token on each side, which resolves to the same
 * 282 pt line length on the frame the canvas was drawn for and keeps behaving on a narrower
 * device, where a hard 280 would stop being a measure and start being a fixed width.
 */
export const makeEmptyStateStyles = (theme: Theme): EmptyStateStyles =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    containerCentred: {
      justifyContent: 'center',
      paddingBottom: theme.spacing.space120,
    },
    containerAnchored: {
      justifyContent: 'flex-start',
      paddingTop: theme.spacing.space56,
    },
    tile: {
      width: theme.sizes.size64,
      height: theme.sizes.size64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.radius20,
    },
    tileBrand: {
      backgroundColor: theme.colors.surface.container,
    },
    tileNeutral: {
      backgroundColor: theme.colors.surface.containerHigh,
    },
    // The filled-brand purple is a surface role, not one of the eight text roles the icon
    // primitive offers — see its `style` prop.
    glyphBrand: {
      color: theme.colors.primary.container,
    },
    title: {
      marginTop: theme.spacing.space12,
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
      paddingHorizontal: theme.spacing.space40,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: theme.spacing.space8,
      marginTop: theme.spacing.space16,
      minHeight: theme.sizes.size48,
      paddingHorizontal: theme.spacing.space24,
      borderRadius: theme.borderRadius.full,
    },
    actionBrand: {
      backgroundColor: theme.colors.primary.base,
      ...theme.shadows.level2,
    },
    actionNeutral: {
      backgroundColor: theme.colors.surface.screen,
      borderWidth: OUTLINE_BORDER_WIDTH,
      borderColor: theme.colors.primary.base,
    },
  });
