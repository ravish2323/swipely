import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, ActivityIndicator, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
} from '@expo-google-fonts/space-grotesk';
import ReviewScreen from './src/screens/ReviewScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingGate from './src/navigation/OnboardingGate';
import { initDatabase } from './src/services/database';
import SMSService from './src/services/smsService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
  });

  useEffect(() => {
    const setupApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        console.log('📦 Initializing database...');
        await initDatabase();
        console.log('✅ Database initialized');
        
        // Initialize SMS service (loads mock data)
        console.log('📱 Initializing SMS service...');
        await SMSService.initialize();
        console.log('✅ SMS service initialized');
        
        // Give a moment for mock data to be saved (reduced delay for faster loading)
        console.log('⏳ Waiting for data to load...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ App initialization complete!');
        setDbInitialized(true);
        setInitializing(false);
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        console.error('Error details:', error.message, error.stack);
        setError(error.message || 'Unknown error occurred');
        setDbInitialized(true); // Still show UI even if DB fails
        setInitializing(false);
      }
    };

    if (fontsLoaded) {
      setupApp();
    }
  }, [fontsLoaded]);


  if (!fontsLoaded || initializing || !dbInitialized) {
    return <LoadingScreen error={error} />;
  }

  if (error && !initializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>⚠️ Initialization Warning</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Trying to load app anyway...</Text>
        <ActivityIndicator size="large" color="#6200EE" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <OnboardingGate
        onOnboardingComplete={(demoMode) => {
          if (demoMode) {
            console.log('Demo mode enabled');
          }
        }}
      >
        <Stack.Navigator
          initialRouteName="Review"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6200EE',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold',
            },
          }}
        >
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ 
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Summary"
            component={SummaryScreen}
            options={{ 
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </OnboardingGate>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Inter_400Regular',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: 'Inter_400Regular',
  },
});

