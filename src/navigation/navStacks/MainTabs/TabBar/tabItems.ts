import { strings } from '@lib/strings';
import { ROUTES } from '@navigation/constants/routes';
import type { MainTabsParamList } from '@navigation/model/paramLists';
import type { IconName } from '@ui/atoms';

export type MainTabRouteName = keyof MainTabsParamList;

interface TabItem {
  readonly icon: IconName;
  readonly label: string;
}

/**
 * What each tab draws. The glyphs are the ones `TabBar.dc.html` sets, and the labels come
 * from the strings module like every other user-facing word.
 */
export const TAB_ITEMS: Readonly<Record<MainTabRouteName, TabItem>> = {
  [ROUTES.TASK_LIST]: { icon: 'check_box', label: strings.tabs.tasks },
  [ROUTES.CALENDAR]: { icon: 'calendar_month', label: strings.tabs.calendar },
  [ROUTES.SETTINGS]: { icon: 'settings', label: strings.tabs.settings },
};

/**
 * React Navigation hands the bar a `Route<string>`, so the route name has to be narrowed
 * before it can index the record above. The guard also gives the bar an honest answer for a
 * route it was never told how to draw: skip it, rather than render a blank tab.
 */
export const isMainTabRoute = (name: string): name is MainTabRouteName =>
  Object.hasOwn(TAB_ITEMS, name);
