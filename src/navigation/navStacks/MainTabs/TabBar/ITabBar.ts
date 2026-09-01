import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

/**
 * The tab bar is rendered by React Navigation, which decides its props. Aliasing them here
 * rather than importing `BottomTabBarProps` into the component keeps
 * `docs/architecture/conventions.md § Components` true — a component's props are always a
 * named `I`-prefixed declaration in its own file — and gives the indirection somewhere to
 * live if the bar ever needs a prop of its own.
 */
export type ITabBarProps = BottomTabBarProps;
