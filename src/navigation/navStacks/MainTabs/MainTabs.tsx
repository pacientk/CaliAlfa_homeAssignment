import { ROUTES } from '@navigation/constants/routes';
import { HIDDEN_HEADER } from '@navigation/constants/screenOptions';
import type { IMainTabScreenProps, MainTabsParamList } from '@navigation/model/paramLists';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarScreen } from '@screens/CalendarScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { TaskListScreen } from '@screens/TaskListScreen';
import type { JSX } from 'react';

import type { ITabBarProps } from './TabBar';
import { TabBar } from './TabBar';

const Tabs = createBottomTabNavigator<MainTabsParamList>();

/**
 * The seam that keeps route names out of `src/screens/`. The epic's layer diagram (§11.1) has
 * navigation depending on screens, so a screen may not import `ROUTES` — it says what it
 * wants done and this wrapper decides where that goes.
 */
const TaskListRoute = ({
  navigation,
}: IMainTabScreenProps<typeof ROUTES.TASK_LIST>): JSX.Element => {
  const createTask = (): void => {
    navigation.navigate(ROUTES.NEW_TASK);
  };

  const openTask = (taskId: string): void => {
    navigation.navigate(ROUTES.TASK_DETAIL, { taskId });
  };

  return <TaskListScreen onCreateTask={createTask} onOpenTask={openTask} />;
};

/**
 * React Navigation calls `tabBar` as a plain function during its own render, so the bar has to
 * be returned as an element rather than passed as the component itself — otherwise its hooks
 * are attributed to the navigator that called it and React rejects them.
 */
const renderTabBar = (props: ITabBarProps): JSX.Element => <TabBar {...props} />;

/** The authenticated shell. Three tabs, drawn by the design's own bar. */
/**
 * The calendar tab's only action is the way back to the list. The screen is handed the
 * intent; the route name stays here, because navigation sits above screens in the layer
 * order and a screen that imported ROUTES would fail lint.
 */
const CalendarRoute = ({
  navigation,
}: IMainTabScreenProps<typeof ROUTES.CALENDAR>): JSX.Element => {
  const goToTasks = (): void => {
    navigation.navigate(ROUTES.TASK_LIST);
  };

  return <CalendarScreen onBackToTasks={goToTasks} />;
};

export const MainTabs = (): JSX.Element => (
  <Tabs.Navigator screenOptions={HIDDEN_HEADER} tabBar={renderTabBar}>
    <Tabs.Screen name={ROUTES.TASK_LIST} component={TaskListRoute} />
    <Tabs.Screen name={ROUTES.CALENDAR} component={CalendarRoute} />
    <Tabs.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
  </Tabs.Navigator>
);
