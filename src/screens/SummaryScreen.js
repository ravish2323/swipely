import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useSwipeNavigation } from '../components/AnimatedNavigationWrapper';
import SummaryGrid from '../components/summary/SummaryGrid';
import StatsCard from '../components/summary/StatsCard';
import DatabaseCard from '../components/summary/DatabaseCard';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import {
  getSummaryStats,
  getTransactionsByStatus,
  getTransactionsByCategory,
  clearAllTransactions,
  resetDatabase,
} from '../services/database';
import SMSService from '../services/smsService';
import spacing from '../theme/spacing';

const SummaryScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [confirmedTransactions, setConfirmedTransactions] = useState([]);
  const [foodTransactions, setFoodTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Animation values for cards
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const summaryStats = await getSummaryStats();
      const confirmed = await getTransactionsByStatus('confirmed');
      const rejected = await getTransactionsByStatus('rejected');
      const special = await getTransactionsByStatus('special');
      const food = await getTransactionsByCategory('food');
      
      // Calculate average confidence from all processed transactions
      const allProcessed = [...confirmed, ...rejected, ...special];
      const avgConfidence = allProcessed.length > 0
        ? allProcessed.reduce((sum, t) => sum + (t.confidence || 0), 0) / allProcessed.length
        : 0;
      
      setStats({
        ...summaryStats,
        averageConfidence: avgConfidence,
      });
      setConfirmedTransactions(confirmed.slice(0, 10));
      setFoodTransactions(food.slice(0, 10));
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (stats && !loading) {
      // Animate cards once when stats are loaded and loading is complete
      cardAnimations.forEach((anim, index) => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [stats, loading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };


  const handleClearTransactions = () => {
    Alert.alert(
      'Clear All Transactions',
      'Are you sure you want to delete all saved transactions? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllTransactions();
              Alert.alert('Success', 'All transactions have been cleared.');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear transactions: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'Are you sure you want to reset the entire database? This will delete all data and recreate the tables. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert('Success', 'Database has been reset successfully.');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset database: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const formatAmount = (amount) => {
    if (!amount || amount === 0) return '₹0';
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    if (!stats) {
      return (
        <View style={styles.centeredContent}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      );
    }

    return (
      <>
        <SummaryGrid
          stats={stats}
          cardAnimations={cardAnimations}
          formatAmount={formatAmount}
        />

        <StatsCard
          stats={stats}
          formatAmount={formatAmount}
        />

        <DatabaseCard
          onClear={handleClearTransactions}
          onReset={handleResetDatabase}
        />
      </>
    );
  };

  // Swipe navigation for body content only - right edge swipe to Review
  const { animatedStyle, panHandlers, translateX } = useSwipeNavigation({
    onSwipeRight: () => navigation.navigate('Review'),
    edgeActivationWidth: 80, // Only activate from 80px from edges
  });

  // Peek card animation based on translateX
  const peekCardOpacity = translateX.interpolate({
    inputRange: [0, 50, SCREEN_WIDTH],
    outputRange: [0, 0.8, 0],
    extrapolate: 'clamp',
  });

  const peekCardTranslateX = translateX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [SCREEN_WIDTH, 0],
    extrapolate: 'clamp',
  });

  return (
    <ScreenShell
      title="Summary"
      useScrollView={true}
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ),
      }}
      bodyAnimatedStyle={animatedStyle}
      bodyPanHandlers={panHandlers}
    >
      <SafeAreaView style={styles.safeAreaContent}>
        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Translucent "Swipe to Review" peek card */}
        <Animated.View
          style={[
            styles.peekCard,
            {
              opacity: peekCardOpacity,
              transform: [{ translateX: peekCardTranslateX }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.peekCardContent}>
            <Text style={styles.peekCardTitle}>Swipe to Review</Text>
            <Text style={styles.peekCardSubtitle}>← Swipe right</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  safeAreaContent: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  peekCard: {
    position: 'absolute',
    top: '50%',
    right: 20,
    width: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    borderRadius: 16,
    padding: 20,
    transform: [{ translateY: -50 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  peekCardContent: {
    alignItems: 'center',
  },
  peekCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_700Bold' }) || 'sans-serif',
  },
  peekCardSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_400Regular' }) || 'sans-serif',
  },
});

export default SummaryScreen;
