import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
import {
  getSummaryStats,
  getTransactionsByStatus,
  getTransactionsByCategory,
  clearAllTransactions,
  resetDatabase,
} from '../services/database';
import SMSService from '../services/smsService';
import SummaryHeader from '../components/summary/SummaryHeader';
import SummaryGrid from '../components/summary/SummaryGrid';
import StatsCard from '../components/summary/StatsCard';
import DatabaseCard from '../components/summary/DatabaseCard';
import spacing from '../theme/spacing';

const SummaryScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [confirmedTransactions, setConfirmedTransactions] = useState([]);
  const [foodTransactions, setFoodTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  
  // Animation values for cards
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // Swipe gesture for navigation
  const swipePosition = useRef(new Animated.ValueXY()).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        swipePosition.setOffset({
          x: swipePosition.x._value,
          y: swipePosition.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        swipePosition.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        swipePosition.flattenOffset();
        
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - go to Review page with smooth transition
          Animated.parallel([
            Animated.timing(swipePosition, {
              toValue: { x: SCREEN_WIDTH, y: 0 },
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            navigation.navigate('Review');
            // Reset position after navigation
            setTimeout(() => {
              swipePosition.setValue({ x: 0, y: 0 });
            }, 100);
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - ignore, just return to center
          Animated.spring(swipePosition, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        } else {
          // Return to center
          Animated.spring(swipePosition, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

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
      // Animate cards when stats are loaded
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
  
  useEffect(() => {
    if (stats) {
      // Animate cards when stats are loaded
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
  }, [stats]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      await SMSService.initialize();
      if (SMSService.hasPermission && SMSService.loadRecentSMS) {
        await SMSService.loadRecentSMS();
      }
      Alert.alert('Success', 'SMS scanning completed!');
      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (error) {
      console.error('Error scanning SMS:', error);
      Alert.alert('Error', 'Failed to scan SMS: ' + (error.message || 'Unknown error'));
    } finally {
      setScanning(false);
    }
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: swipePosition.x }],
            opacity: swipePosition.x.interpolate({
              inputRange: [0, SCREEN_WIDTH],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <SummaryHeader
          title=\"Summary\"
          subtitle=\"Processed activity and controls\"
          paddingHorizontal={spacing.xl}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            <SummaryGrid
              stats={stats}
              cardAnimations={cardAnimations}
              formatAmount={formatAmount}
              marginBottom={spacing.xxl}
            />

            <StatsCard
              stats={stats}
              formatAmount={formatAmount}
              marginBottom={spacing.xxl}
              padding={spacing.xl}
            />

            <DatabaseCard
              onClear={handleClearTransactions}
              onReset={handleResetDatabase}
              marginBottom={spacing.xxl}
              padding={spacing.xl}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
});

export default SummaryScreen;
