import { AppView } from '@ui/atoms';
import { useTheme, useThemedStyles } from '@ui/tokens';
import type { JSX } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ITabBarProps } from './ITabBar';
import { makeTabBarStyles } from './TabBar.styles';
import { TabBarItem } from './TabBarItem';
import { isMainTabRoute, TAB_ITEMS } from './tabItems';

const NO_INSET = 0;

/**
 * The design's tab bar, drawn from `TabBar.dc.html` rather than from React Navigation's
 * default: the filled pill behind the active glyph is not something the stock bar can be
 * configured into.
 *
 * The bottom padding is the home-indicator inset, which is 34 pt on the iPhone 16 Pro the
 * canvas was drawn for and 0 on a device with a physical home button. Falling back to the
 * base rhythm unit there keeps the labels off the screen edge.
 */
export const TabBar = ({ state, navigation }: ITabBarProps): JSX.Element => {
  const styles = useThemedStyles(makeTabBarStyles);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom === NO_INSET ? theme.spacing.space8 : insets.bottom;

  return (
    <AppView style={[styles.bar, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        if (!isMainTabRoute(route.name)) {
          return null;
        }

        const item = TAB_ITEMS[route.name];
        const isFocused = state.index === index;

        const openTab = (): void => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (isFocused || event.defaultPrevented) {
            return;
          }

          navigation.navigate(route.name);
        };

        return (
          <TabBarItem
            key={route.key}
            icon={item.icon}
            label={item.label}
            isFocused={isFocused}
            onPress={openTab}
            testID={`tabBar.${route.name}`}
          />
        );
      })}
    </AppView>
  );
};
