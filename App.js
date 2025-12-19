import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import ReviewScreen from './src/screens/ReviewScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import { initDatabase } from './src/services/database';
import SMSService from './src/services/smsService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Give a moment for mock data to be saved
        console.log('⏳ Waiting for data to load...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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

    setupApp();

  }, []);

  if (initializing || !dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading SpendSwipe...</Text>
        <Text style={styles.loadingSubtext}>Setting up database and loading transactions</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Text style={styles.errorSubtext}>The app will still work, but some features may be limited.</Text>
          </View>
        )}
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
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{ title: "Today's Inbox" }}
        />
        <Stack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{ title: 'Summary' }}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 5,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    opacity: 0.8,
  },
});

