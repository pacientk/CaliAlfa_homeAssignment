import { ROUTES } from '@navigation/constants/routes';
import { HIDDEN_HEADER } from '@navigation/constants/screenOptions';
import type { AuthStackParamList, IAuthStackScreenProps } from '@navigation/model/paramLists';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PhoneNumberScreen } from '@screens/PhoneNumberScreen';
import { VerificationCodeScreen } from '@screens/VerificationCodeScreen';
import { WelcomeScreen } from '@screens/WelcomeScreen';
import type { JSX } from 'react';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const WelcomeRoute = ({
  navigation,
}: IAuthStackScreenProps<typeof ROUTES.WELCOME>): JSX.Element => {
  const openPhoneNumber = (): void => {
    navigation.navigate(ROUTES.PHONE_NUMBER);
  };

  return <WelcomeScreen onContinue={openPhoneNumber} />;
};

const PhoneNumberRoute = ({
  navigation,
}: IAuthStackScreenProps<typeof ROUTES.PHONE_NUMBER>): JSX.Element => {
  const openVerificationCode = (): void => {
    navigation.navigate(ROUTES.VERIFICATION_CODE);
  };

  return <PhoneNumberScreen onSubmit={openVerificationCode} />;
};

/**
 * Signed out. Accepting the code does not push a route from here — it sets the session, and
 * `RootNavigator` swaps this whole stack for the tab shell, which is why the verification
 * screen needs no wrapper.
 */
export const AuthStack = (): JSX.Element => (
  <Stack.Navigator screenOptions={HIDDEN_HEADER}>
    <Stack.Screen name={ROUTES.WELCOME} component={WelcomeRoute} />
    <Stack.Screen name={ROUTES.PHONE_NUMBER} component={PhoneNumberRoute} />
    <Stack.Screen name={ROUTES.VERIFICATION_CODE} component={VerificationCodeScreen} />
  </Stack.Navigator>
);
