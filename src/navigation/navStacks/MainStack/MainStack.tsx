import { ROUTES } from '@navigation/constants/routes';
import { HIDDEN_HEADER } from '@navigation/constants/screenOptions';
import type { IMainStackScreenProps, MainStackParamList } from '@navigation/model/paramLists';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewTaskScreen } from '@screens/NewTaskScreen';
import { TaskDetailScreen } from '@screens/TaskDetailScreen';
import type { JSX } from 'react';

import { MainTabs } from '../MainTabs';

const Stack = createNativeStackNavigator<MainStackParamList>();

const NewTaskRoute = ({
  navigation,
}: IMainStackScreenProps<typeof ROUTES.NEW_TASK>): JSX.Element => {
  const closeForm = (): void => {
    navigation.goBack();
  };

  return <NewTaskScreen onClose={closeForm} />;
};

const TaskDetailRoute = ({
  navigation,
  route,
}: IMainStackScreenProps<typeof ROUTES.TASK_DETAIL>): JSX.Element => {
  const closeDetail = (): void => {
    navigation.goBack();
  };

  return <TaskDetailScreen taskId={route.params.taskId} onClose={closeDetail} />;
};

/**
 * Signed in. The tab shell is one screen in this stack, and the two screens the design draws
 * without a tab bar — new task (B6) and task detail (B8) — are pushed on top of it.
 */
export const MainStack = (): JSX.Element => (
  <Stack.Navigator screenOptions={HIDDEN_HEADER}>
    <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabs} />
    <Stack.Screen name={ROUTES.NEW_TASK} component={NewTaskRoute} />
    <Stack.Screen name={ROUTES.TASK_DETAIL} component={TaskDetailRoute} />
  </Stack.Navigator>
);
