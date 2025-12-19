import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Summary Cards Grid */}
          <View style={styles.summaryGrid}>
            <Animated.View 
              style={[
                styles.summaryCard, 
                styles.confirmedCard,
                {
                  opacity: cardAnimations[0],
                  transform: [{
                    translateY: cardAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.summaryCardTitle}>CONFIRMED</Text>
              <Text style={styles.summaryCardValue}>{stats.confirmed.count}</Text>
              <Text style={styles.summaryCardAmount}>
                {formatAmount(stats.confirmed.total)}
              </Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.summaryCard, 
                styles.foodCard,
                {
                  opacity: cardAnimations[1],
                  transform: [{
                    translateY: cardAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.summaryCardTitle}>FOOD</Text>
              <Text style={styles.summaryCardValue}>{stats.food.count}</Text>
              <Text style={styles.summaryCardAmount}>
                {formatAmount(stats.food.total)}
              </Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.summaryCard, 
                styles.rejectedCard,
                {
                  opacity: cardAnimations[2],
                  transform: [{
                    translateY: cardAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.summaryCardTitle}>REJECTED</Text>
              <Text style={styles.summaryCardValue}>{stats.rejected.count}</Text>
              <Text style={styles.summaryCardSubtext}>Not tracked</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.summaryCard, 
                styles.specialCard,
                {
                  opacity: cardAnimations[3],
                  transform: [{
                    translateY: cardAnimations[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.summaryCardTitle}>SPECIAL</Text>
              <Text style={styles.summaryCardValue}>{stats.special.count}</Text>
              <Text style={styles.summaryCardAmount}>
                {formatAmount(stats.special.total)}
              </Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.summaryCard, 
                styles.pendingCard,
                {
                  opacity: cardAnimations[4],
                  transform: [{
                    translateY: cardAnimations[4].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.summaryCardTitle}>PENDING</Text>
              <Text style={styles.summaryCardValue}>{stats.pending.count}</Text>
              <Text style={styles.summaryCardSubtext}>Awaiting review</Text>
            </Animated.View>
          </View>

          {/* Statistics Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsCardTitle}>Statistics</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Transactions Processed</Text>
              <Text style={styles.statValue}>
                {stats.confirmed.count + stats.rejected.count + stats.special.count}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Amount Tracked</Text>
              <Text style={styles.statValue}>
                {formatAmount(stats.confirmed.total + stats.special.total)}
              </Text>
            </View>
            <View style={[styles.statRow, styles.statRowLast]}>
              <Text style={styles.statLabel}>Average Confidence</Text>
              <Text style={styles.statValue}>
                {stats.averageConfidence
                  ? Math.round(stats.averageConfidence * 100)
                  : 0}
                %
              </Text>
            </View>
          </View>

          {/* Database Management Card */}
          <View style={styles.dbCard}>
            <Text style={styles.dbCardTitle}>Database Management</Text>
            <Text style={styles.dbCardDescription}>
              Manage your transaction data. Use with caution as these actions cannot be undone.
            </Text>
            <View style={styles.dbButtonsRow}>
              <TouchableOpacity
                style={[styles.dbButton, styles.clearButton]}
                onPress={handleClearTransactions}
              >
                <Text style={styles.dbButtonText}>Clear Transactions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dbButton, styles.resetButton]}
                onPress={handleResetDatabase}
              >
                <Text style={styles.dbButtonText}>Reset Database</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.5,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  confirmedCard: {
    backgroundColor: '#e8f7f0', // Soft mint
  },
  foodCard: {
    backgroundColor: '#fff5d9', // Pale yellow
  },
  rejectedCard: {
    backgroundColor: '#ffe6e6', // Pale red
  },
  specialCard: {
    backgroundColor: '#edf0ff', // Pale blue-lavender
  },
  pendingCard: {
    backgroundColor: '#e4f8ff', // Light cyan
  },
  summaryCardTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  summaryCardAmount: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  summaryCardSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  statsCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  statsCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statRowLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dbCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  dbCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  dbCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: '400',
  },
  dbButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dbButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  clearButton: {
    backgroundColor: '#ffe6e6', // Soft red
  },
  resetButton: {
    backgroundColor: '#fff5d9', // Soft yellow
  },
  dbButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
});

export default SummaryScreen;
