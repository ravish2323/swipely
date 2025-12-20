import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useSwipeNavigation } from '../components/AnimatedNavigationWrapper';
import StatCard from '../components/StatCard';
import PendingBanner from '../components/PendingBanner';
import InsightsCard from '../components/InsightsCard';
import ManagementCard from '../components/ManagementCard';
import HeroTotalCard from '../components/HeroTotalCard';
import {
  getSummaryStats,
  getTransactionsByStatus,
  getTransactionsByCategory,
  clearAllTransactions,
  resetDatabase,
} from '../services/database';
import { colors, spacing } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SummaryScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState(null);
  const [dateRange, setDateRange] = useState('Today');

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

      // Calculate average confidence from all processed transactions
      const allProcessed = [...confirmed, ...rejected, ...special];
      const avgConfidence =
        allProcessed.length > 0
          ? allProcessed.reduce((sum, t) => sum + (t.confidence || 0), 0) / allProcessed.length
          : 0;

      // Get last processed timestamp
      const lastProcessed =
        allProcessed.length > 0
          ? Math.max(...allProcessed.map((t) => t.timestamp || 0))
          : null;
      setLastProcessedTimestamp(lastProcessed);

      setStats({
        ...summaryStats,
        averageConfidence: avgConfidence,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


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

  // Swipe navigation for body content only - right edge swipe to Review
  const { animatedStyle, panHandlers, translateX } = useSwipeNavigation({
    onSwipeRight: () => navigation.navigate('Review'),
    edgeActivationWidth: 80,
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

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={colors.primary} />
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

    const totalSpent = (stats.confirmed?.total || 0) + (stats.food?.total || 0);

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <HeroTotalCard totalAmount={totalSpent} dateRange={dateRange} />

        {/* 2x2 Stat Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatCard
              label="Confirmed"
              count={stats.confirmed?.count || 0}
              amount={formatAmount(stats.confirmed?.total || 0)}
              backgroundColor={colors.successBg}
            />
          </View>

          <View style={styles.gridItem}>
            <StatCard
              label="Food"
              count={stats.food?.count || 0}
              amount={formatAmount(stats.food?.total || 0)}
              backgroundColor={colors.foodBg}
            />
          </View>

          <View style={styles.gridItem}>
            <StatCard
              label="Special"
              count={stats.special?.count || 0}
              amount={formatAmount(stats.special?.total || 0)}
              backgroundColor={colors.specialBg}
            />
          </View>

          <View style={styles.gridItem}>
            <StatCard
              label="Rejected"
              count={stats.rejected?.count || 0}
              backgroundColor={colors.rejectBg}
              variant="rejected"
            />
          </View>
        </View>

        {/* Pending Banner */}
        {stats.pending?.count > 0 && (
          <PendingBanner
            pendingCount={stats.pending.count}
            onPress={() => navigation.navigate('Review')}
          />
        )}

        {/* Insights Card */}
        <InsightsCard
          averageConfidence={stats.averageConfidence || 0}
          lastProcessedTimestamp={lastProcessedTimestamp}
        />

        {/* Management Card */}
        <ManagementCard onClear={handleClearTransactions} onReset={handleResetDatabase} />
      </ScrollView>
    );
  };

  return (
    <ScreenShell
      title="Summary"
      useScrollView={false}
      bodyAnimatedStyle={animatedStyle}
      bodyPanHandlers={panHandlers}
    >
      <View style={styles.container}>
        {renderContent()}

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
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    marginBottom: spacing.md,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  peekCard: {
    position: 'absolute',
    top: '50%',
    right: 20,
    width: 200,
    backgroundColor: 'rgba(124, 92, 250, 0.9)',
    borderRadius: 16,
    padding: 20,
    transform: [{ translateY: -50 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
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
