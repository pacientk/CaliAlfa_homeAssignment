import type { ROUTES } from '@navigation/constants/routes';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** The one route in the app that carries a parameter. */
export interface TaskDetailParams {
  readonly taskId: string;
}

/**
 * Every route the container can hold, with its parameters. The per-navigator lists below are
 * derived from it rather than declared beside it, so a route's parameter shape is written
 * once — `docs/architecture/principles.md § DRY`.
 */
export type RootStackParamList = {
  [ROUTES.WELCOME]: undefined;
  [ROUTES.PHONE_NUMBER]: undefined;
  [ROUTES.VERIFICATION_CODE]: undefined;
  [ROUTES.MAIN_TABS]: NavigatorScreenParams<MainTabsParamList> | undefined;
  [ROUTES.NEW_TASK]: undefined;
  [ROUTES.TASK_DETAIL]: TaskDetailParams;
};

/** The three tabs, in the order the design's tab bar draws them. */
export type MainTabsParamList = {
  [ROUTES.TASK_LIST]: undefined;
  [ROUTES.CALENDAR]: undefined;
  [ROUTES.SETTINGS]: undefined;
};

/** Signed out: the three auth screens and nothing else. */
export type AuthStackParamList = Pick<
  RootStackParamList,
  typeof ROUTES.WELCOME | typeof ROUTES.PHONE_NUMBER | typeof ROUTES.VERIFICATION_CODE
>;

/**
 * Signed in: the tab shell, plus the two screens the design draws *without* a tab bar
 * (artboards B6 and B8), which is why they are pushed above the tabs rather than nested in a
 * tab's own stack.
 */
export type MainStackParamList = Pick<
  RootStackParamList,
  typeof ROUTES.MAIN_TABS | typeof ROUTES.NEW_TASK | typeof ROUTES.TASK_DETAIL
>;

export type IAuthStackScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;

export type IMainStackScreenProps<RouteName extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, RouteName>;

/**
 * A tab screen can navigate within the tabs *and* push onto the stack above them — opening
 * the new-task form from the list is exactly that. `CompositeScreenProps` is what types the
 * second half; without it `navigation.navigate(ROUTES.NEW_TASK)` would not compile.
 */
export type IMainTabScreenProps<RouteName extends keyof MainTabsParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, RouteName>,
  NativeStackScreenProps<MainStackParamList>
>;
