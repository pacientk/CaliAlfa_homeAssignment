/**
 * The atom layer's public surface.
 *
 * These are the only files in the project permitted to import a React Native primitive; the
 * lint rule in `eslint.config.mjs` blocks `View`, `Text`, `Pressable`, `TextInput`,
 * `ScrollView`, and `FlatList` everywhere else. The reason is not stylistic: this is where
 * the theme, the font-scale cap, the touch-target floor, and the accessibility defaults are
 * applied once, so a raw `<Text>` elsewhere is a place where all four silently do not happen.
 */
export type { IAppFlashListProps } from './AppFlashList';
export { AppFlashList } from './AppFlashList';
export type { IAppIconProps, IconName, IconSize } from './AppIcon';
export { AppIcon } from './AppIcon';
export type { IAppModalProps } from './AppModal';
export { AppModal } from './AppModal';
export type { IAppPressableProps, PressableRole } from './AppPressable';
export { AppPressable } from './AppPressable';
export type { IAppScrollViewProps } from './AppScrollView';
export { AppScrollView } from './AppScrollView';
export type { IAppSearchFieldProps } from './AppSearchField';
export { AppSearchField } from './AppSearchField';
export type { IAppTextProps, TextColorRole, TextVariant } from './AppText';
export { AppText } from './AppText';
export type { IAppTextInputProps } from './AppTextInput';
export { AppTextInput } from './AppTextInput';
export type { IAppViewProps } from './AppView';
export { AppView } from './AppView';
