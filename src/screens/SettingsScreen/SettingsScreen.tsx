import { signOut, useSessionPhoneNumber } from '@features/auth';
import { strings } from '@lib/strings';
import { AppIcon, AppPressable, AppScrollView, AppText, AppView } from '@ui/atoms';
import { useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PreferenceRow } from './PreferenceRow';
import { makeSettingsScreenStyles } from './SettingsScreen.styles';

/**
 * Artboard C2 — the account, three preferences that are drawn but not built, and signing out.
 *
 * Signing out calls the auth feature and does nothing else. The root navigator already
 * switches stacks on the session flag, so a `navigate` here would be a second thing deciding
 * where the user goes — and the one that loses the race leaves a screen standing after the
 * session it belonged to is gone.
 *
 * The cached tasks deliberately survive. The API is single-tenant by construction (epic §6),
 * so there is no second user whose data a stale cache could leak to, and keeping it means the
 * next sign-in renders the list from the first frame instead of from a spinner.
 *
 * The number is shown exactly as the session reports it, in E.164. Pretty-printing it would
 * mean a country-by-country format table, which buys nothing the user cannot already read.
 */
export const SettingsScreen = (): JSX.Element => {
  const styles = useThemedStyles(makeSettingsScreenStyles);
  const insets = useSafeAreaInsets();
  const phoneNumber = useSessionPhoneNumber();

  return (
    <AppView style={[styles.screen, { paddingTop: insets.top }]}>
      <AppView style={styles.header}>
        <AppText
          variant="title"
          color="accent"
          accessibilityRole="header"
          style={styles.headerTitle}
        >
          {strings.settings.title}
        </AppText>
      </AppView>

      <AppScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <AppView style={styles.account} testID="settings.account">
          <AppView style={styles.avatar} testID="settings.avatar">
            <AppIcon name="person" size="size26" color="accent" />
          </AppView>

          <AppView>
            <AppText variant="subtitle" testID="settings.phoneNumber">
              {phoneNumber ?? strings.settings.account.unknownPhone}
            </AppText>
            <AppText variant="caption" color="tertiary">
              {strings.settings.account.device}
            </AppText>
          </AppView>
        </AppView>

        <AppText variant="overline" color="tertiary" style={styles.sectionHeading}>
          {strings.settings.preferences.heading}
        </AppText>

        <AppView style={styles.preferences}>
          <PreferenceRow
            icon="notifications"
            label={strings.settings.preferences.notifications}
            value={strings.settings.preferences.soon}
            hasTag
            hasDivider={false}
            testID="settings.notifications"
          />
          <PreferenceRow
            icon="light_mode"
            label={strings.settings.preferences.appearance}
            value={strings.settings.preferences.appearanceValue}
            hasTag={false}
            hasDivider
            testID="settings.appearance"
          />
          <PreferenceRow
            icon="info"
            label={strings.settings.preferences.about}
            value={strings.settings.preferences.aboutValue}
            hasTag={false}
            hasDivider
            testID="settings.about"
          />
        </AppView>

        <AppPressable
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel={strings.settings.signOut}
          style={styles.signOut}
          testID="settings.signOut"
        >
          <AppIcon name="logout" size="size20" color="error" />
          <AppText variant="bodyStrong" color="error">
            {strings.settings.signOut}
          </AppText>
        </AppPressable>

        <AppText variant="caption" color="tertiary" style={styles.signOutNote}>
          {strings.settings.signOutNote}
        </AppText>
      </AppScrollView>
    </AppView>
  );
};
