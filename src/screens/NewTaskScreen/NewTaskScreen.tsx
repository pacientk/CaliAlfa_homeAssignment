import { strings } from '@lib/strings';
import { PlaceholderScreen } from '@widgets/PlaceholderScreen';
import type { JSX } from 'react';

import type { INewTaskScreenProps } from './INewTaskScreen';

/** Placeholder for artboards B6–B7. T-011 replaces the body. */
export const NewTaskScreen = ({ onClose }: INewTaskScreenProps): JSX.Element => (
  <PlaceholderScreen
    title={strings.newTask.title}
    subtitle={strings.newTask.subtitle}
    actions={[{ label: strings.newTask.close, onPress: onClose }]}
  />
);
