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

  return <PhoneNumberScreen onBack={navigation.goBack} onCodeSent={openVerificationCode} />;
};

const VerificationCodeRoute = ({
  navigation,
}: IAuthStackScreenProps<typeof ROUTES.VERIFICATION_CODE>): JSX.Element => (
  <VerificationCodeScreen onBack={navigation.goBack} />
);

/**
 * Signed out. Accepting the code does not push a route from here — it creates the session, and
 * `RootNavigator` swaps this whole stack for the tab shell, which is why the verification route
 * only has to wire a way back.
 *
 * The three route components are module-level rather than inline closures: a component declared
 * inside another remounts its entire subtree on every render of the parent
 * (`docs/architecture/principles.md § Component Decomposition`), which on this stack would drop
 * the digits the user has typed.
 */
export const AuthStack = (): JSX.Element => (
  <Stack.Navigator screenOptions={HIDDEN_HEADER}>
    <Stack.Screen name={ROUTES.WELCOME} component={WelcomeRoute} />
    <Stack.Screen name={ROUTES.PHONE_NUMBER} component={PhoneNumberRoute} />
    <Stack.Screen name={ROUTES.VERIFICATION_CODE} component={VerificationCodeRoute} />
  </Stack.Navigator>
);
