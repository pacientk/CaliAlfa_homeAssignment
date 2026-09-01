import { AuthPrimaryButton } from '@features/auth';
import { strings } from '@lib/strings';
import { AppPressable, AppScrollView, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IBenefitRowProps } from './BenefitRow';
import { BenefitRow } from './BenefitRow';
import type { IWelcomeScreenProps } from './IWelcomeScreen';
import { TaskStackIllustration } from './TaskStackIllustration';
import { makeWelcomeScreenStyles } from './WelcomeScreen.styles';

/** Artboard A1's three rows, in the order it draws them. */
const BENEFITS: readonly IBenefitRowProps[] = [
  { icon: 'bolt', ...strings.welcome.benefits.capture },
  { icon: 'target', ...strings.welcome.benefits.momentum },
  { icon: 'shield', ...strings.welcome.benefits.privacy },
];

/**
 * Artboard A1.
 *
 * "Log in" and "Next" run the same callback, and that is the product decision rather than an
 * oversight: registration and sign-in are one flow through a phone number, so there is no
 * second screen for a returning user to be sent to. The line stays because a returning user
 * looks for it, and finding it lands them exactly where they wanted to be.
 */
export const WelcomeScreen = ({ onContinue }: IWelcomeScreenProps): JSX.Element => {
  const styles = useThemedStyles(makeWelcomeScreenStyles);
  const insets = useSafeAreaInsets();

  return (
    <AppView style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AppScrollView contentContainerStyle={styles.content}>
        <AppView style={styles.badge}>
          <AppText variant="overline" color="accent">
            {strings.welcome.badge}
          </AppText>
        </AppView>

        <AppText variant="headline" accessibilityRole="header" style={styles.title}>
          {strings.welcome.titleLead}
          {'\n'}
          <AppText variant="headline" color="accent">
            {strings.welcome.titleAccent}
          </AppText>
        </AppText>

        <AppText color="secondary" style={styles.subtitle}>
          {strings.welcome.subtitle}
        </AppText>

        <AppView style={styles.illustration}>
          <TaskStackIllustration />
        </AppView>

        <AppView style={styles.benefits}>
          {BENEFITS.map(benefit => (
            <BenefitRow key={benefit.icon} {...benefit} />
          ))}
        </AppView>

        <AppView style={styles.spacer} />

        <AuthPrimaryButton
          label={strings.welcome.continue}
          icon="arrow_forward"
          onPress={onContinue}
          testID="welcome.next"
        />

        <AppView style={styles.logIn}>
          <AppText variant="bodySmall" color="secondary">
            {strings.welcome.logInPrompt}
          </AppText>
          <AppPressable
            onPress={onContinue}
            accessibilityRole="link"
            accessibilityLabel={strings.welcome.logIn}
            testID="welcome.logIn"
          >
            <AppText variant="labelPlain" color="accent">
              {strings.welcome.logIn}
            </AppText>
          </AppPressable>
        </AppView>
      </AppScrollView>
    </AppView>
  );
};
