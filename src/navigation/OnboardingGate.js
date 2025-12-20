import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';
import TutorialScreen from '../screens/onboarding/TutorialScreen';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();
const ONBOARDING_KEY = 'swipely.onboardingSeen';
const DEMO_MODE_KEY = 'swipely.demoMode';

export const OnboardingGate = ({ children, onOnboardingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboarding(seen === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (demoMode = false) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      if (demoMode) {
        await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      }
      setHasSeenOnboarding(true);
      if (onOnboardingComplete) {
        onOnboardingComplete(demoMode);
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasSeenOnboarding) {
    return children;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome">
        {(props) => <WelcomeScreen {...props} onNext={() => props.navigation.navigate('Permissions')} />}
      </Stack.Screen>
      <Stack.Screen name="Permissions">
        {(props) => (
          <PermissionsScreen
            {...props}
            onNext={() => props.navigation.navigate('Tutorial')}
            onSkip={async () => {
              await completeOnboarding(true);
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Tutorial">
        {(props) => (
          <TutorialScreen
            {...props}
            onComplete={async () => {
              await completeOnboarding(false);
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});

export default OnboardingGate;

