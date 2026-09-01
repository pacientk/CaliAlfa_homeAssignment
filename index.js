/**
 * @format
 */

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import { AppRoot } from './src/app';

AppRegistry.registerComponent(appName, () => AppRoot);
