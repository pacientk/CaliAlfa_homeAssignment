import { AppIcon, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';

import { makeBenefitRowStyles } from './BenefitRow.styles';
import type { IBenefitRowProps } from './IBenefitRow';

/** One of artboard A1's three reasons to sign in. */
export const BenefitRow = ({ icon, title, description }: IBenefitRowProps): JSX.Element => {
  const styles = useThemedStyles(makeBenefitRowStyles);

  return (
    <AppView style={styles.row}>
      <AppView style={styles.tile}>
        <AppIcon name={icon} size="size20" color="accent" />
      </AppView>
      <AppView style={styles.copy}>
        <AppText variant="labelPlain">{title}</AppText>
        <AppText variant="caption" color="secondary">
          {description}
        </AppText>
      </AppView>
    </AppView>
  );
};
