import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, ActivityIndicator, Platform, Animated, Image } from 'react-native';
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
import { initDatabase } from './src/services/database';
import SMSService from './src/services/smsService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  // Pulsing animation for bolt
  const boltScale = useRef(new Animated.Value(1)).current;
  const boltOpacity = useRef(new Animated.Value(1)).current;
  
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

  useEffect(() => {
    if (!fontsLoaded || initializing || !dbInitialized) {
      // Pulsing animation for bolt
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(boltScale, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(boltOpacity, {
              toValue: 0.6,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(boltScale, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(boltOpacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [fontsLoaded, initializing, dbInitialized, boltScale, boltOpacity]);

  if (!fontsLoaded || initializing || !dbInitialized) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashContent}>
          <Animated.View
            style={{
              transform: [{ scale: boltScale }],
              opacity: boltOpacity,
            }}
          >
            <Image
              source={require('./assets/ChatGPT Image Dec 20, 2025, 10_45_05 PM.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.splashTitle}>Swipe your expenses into control</Text>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubtext}>The app will still work, but some features may be limited.</Text>
            </View>
          )}
        </View>
      </View>
    );
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
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  splashTitle: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    paddingHorizontal: 40,
    letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_700Bold' }) || 'sans-serif',
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    maxWidth: '90%',
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

