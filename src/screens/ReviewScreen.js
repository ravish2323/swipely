import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import FilterPills from '../components/FilterPills';
import ProgressRow from '../components/ProgressRow';
import TransactionCard from '../components/TransactionCard';
import SwipeHints from '../components/SwipeHints';
import ActionBar from '../components/ActionBar';
import BottomBar from '../components/BottomBar';
import CelebrationBurst from '../components/CelebrationBurst';
import {
  getPendingTransactions,
  updateTransactionStatus,
  updateTransactionCategory,
} from '../services/database';
import SMSService from '../services/smsService';
import { colors, spacing } from '../theme/tokens';
import { colors as tokenColors } from '../theme/tokens';
import { durations, easing } from '../theme/anim';

// Optional haptics import
let Haptics = null;
try {
  Haptics = require('expo-haptics').default || require('expo-haptics');
} catch (e) {
  // Haptics not available
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ReviewScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [showPrevCardModal, setShowPrevCardModal] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [overlayColor, setOverlayColor] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionProcessed, setSessionProcessed] = useState(0);
  const actionBarAnimation = useRef(new Animated.Value(0)).current;

  const loadTransactions = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const pending = await getPendingTransactions();
      setTransactions(pending);
      const filtered = applyDateFilter(pending, dateFilter);
      
      // Reset session tracking when loading new data
      if (showLoading) {
        setSessionTotal(filtered.length);
        setSessionProcessed(0);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load transactions. ' + error.message);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [dateFilter]);

  const applyDateFilter = (txns, filter) => {
    if (!txns || txns.length === 0) {
      setFilteredTransactions([]);
      return [];
    }

    const now = new Date();
    let startDate = null;

    switch (filter) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = null;
        break;
    }

    if (startDate) {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const filtered = txns.filter(t => t.timestamp >= startTimestamp);
      setFilteredTransactions(filtered);
      return filtered;
    } else {
      setFilteredTransactions(txns);
      return txns;
    }
  };

  useEffect(() => {
    loadTransactions(true);

    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions(true);
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, loadTransactions]);

  useEffect(() => {
    const filtered = applyDateFilter(transactions, dateFilter);
    // Reset session tracking when filter changes
    setSessionTotal(filtered.length);
    setSessionProcessed(0);
  }, [dateFilter, transactions]);

  const handleSwipe = async (id, status, category = null, actionType = null) => {
    try {
      const transaction = transactions.find(t => t.id === id);

      if (transaction) {
        let actionTypeName = 'confirm';
        if (status === 'rejected') actionTypeName = 'reject';
        else if (status === 'special') actionTypeName = 'favorite';
        else if (category === 'food') actionTypeName = 'food';

        setLastAction({
          type: actionTypeName,
          transaction: { ...transaction },
        });
      }

      // Update UI state IMMEDIATELY (before async DB update) for instant feedback
      const newTransactions = transactions.filter(t => t.id !== id);
      const newFiltered = filteredTransactions.filter(t => t.id !== id);
      
      setTransactions(newTransactions);
      setFilteredTransactions(newFiltered);
      setOverlayColor(null);
      
      // Update session processed count
      setSessionProcessed(prev => prev + 1);

      // Update database asynchronously (non-blocking)
      try {
        await updateTransactionStatus(id, status);
        if (category) {
          await updateTransactionCategory(id, category);
        }
      } catch (dbError) {
        console.error('Error updating transaction in database:', dbError);
        // Don't show alert - UI already updated, just log the error
      }
    } catch (error) {
      console.error('Error in handleSwipe:', error);
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  const handleManualAction = async (status, category = null, actionType = null) => {
    if (filteredTransactions.length === 0) return;
    const current = filteredTransactions[0];

    // Set overlay color for visual feedback
    if (status === 'rejected') setOverlayColor(tokenColors.rejectBg);
    else if (status === 'special') setOverlayColor(tokenColors.specialBg);
    else if (category === 'food') setOverlayColor(tokenColors.foodBg);
    else if (status === 'confirmed') setOverlayColor(tokenColors.successBg);

    // Small delay for visual feedback, then swipe
    setTimeout(() => {
      handleSwipe(current.id, status, category, actionType);
    }, 100);
    
    // Don't close actions - allow multiple actions
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'reject': return tokenColors.rejectBg;
      case 'favorite': return tokenColors.specialBg;
      case 'food': return tokenColors.foodBg;
      case 'confirm': return tokenColors.successBg;
      default: return colors.bg;
    }
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case 'reject': return 'Rejected';
      case 'favorite': return 'Favorited';
      case 'food': return 'Food';
      case 'confirm': return 'Confirmed';
      default: return 'Unknown';
    }
  };

  const handleFilterChange = (filter) => {
    setDateFilter(filter);
    // Filter is applied automatically by useEffect that watches dateFilter
    // No need to reload from database - just filter existing transactions
  };

  const toggleActions = () => {
    const toValue = actionsOpen ? 0 : 1;
    setActionsOpen(!actionsOpen);

    // Haptic feedback
    if (Haptics && Haptics.ImpactFeedbackStyle) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics failed
      }
    }

    Animated.timing(actionBarAnimation, {
      toValue,
      duration: 180,
      easing: easing.out,
      useNativeDriver: true,
    }).start();
  };

  const closeActions = () => {
    if (actionsOpen) {
      setActionsOpen(false);
      Animated.timing(actionBarAnimation, {
        toValue: 0,
        duration: 180,
        easing: easing.out,
        useNativeDriver: true,
      }).start();
    }
  };

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentCard = filteredTransactions[0];
  const remainingCount = filteredTransactions.length;
  const hasCards = filteredTransactions.length > 0;

  const renderEmptyState = () => {
    if (filteredTransactions.length === 0 && transactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <CelebrationBurst
            visible={true}
            onDone={() => {
              // Animation complete, keep static UI
            }}
          />
          <View style={styles.emptyStateContent}>
            <Text style={styles.emptyStateTitle}>All caught up!</Text>
            <Text style={styles.emptyStateSubtitle}>
              You've reviewed everything for this period.
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <ScreenShell
      title="Review"
      topSlot={
        <>
          <FilterPills activeFilter={dateFilter} onFilterChange={handleFilterChange} />
          {hasCards && (
            <ProgressRow
              total={sessionTotal || remainingCount}
              remaining={remainingCount}
              onEyePressIn={() => setShowPrevCardModal(true)}
              onEyePressOut={() => setShowPrevCardModal(false)}
            />
          )}
        </>
      }
      bottomSlot={
        hasCards ? (
          <>
            <SwipeHints />
            {/* Action Bar - conditionally visible above bottom bar */}
            <Animated.View
              style={[
                styles.actionBarContainer,
                {
                  opacity: actionBarAnimation,
                  transform: [
                    {
                      translateY: actionBarAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents={actionsOpen ? 'auto' : 'none'}
            >
              <View style={styles.actionBarWrapper} testID="actionBar">
                <ActionBar
                  onReject={() => handleManualAction('rejected', null, 'reject')}
                  onFood={() => handleManualAction('confirmed', 'food', 'food')}
                  onSpecial={() => handleManualAction('special', null, 'favorite')}
                  onConfirm={() => handleManualAction('confirmed', null, 'confirm')}
                />
              </View>
            </Animated.View>
            {/* Bottom Bar - always visible */}
            <BottomBar
              onSummaryPress={() => navigation.navigate('Summary')}
              onActionsToggle={toggleActions}
              actionsOpen={actionsOpen}
            />
          </>
        ) : (
          <BottomBar
            onSummaryPress={() => navigation.navigate('Summary')}
            onActionsToggle={null}
            actionsOpen={false}
          />
        )
      }
    >
      <View style={styles.body}>
        {hasCards && currentCard ? (
          <View style={styles.cardContainer}>
            <TransactionCard
              key={currentCard.id}
              transaction={currentCard}
              onSwipe={handleSwipe}
              overlayColor={overlayColor}
            />
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Overlay modal for closing action buttons when tapping outside */}
      <Modal
        visible={actionsOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeActions}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Overlay that covers everything except bottom action area */}
          <Pressable
            style={{ flex: 1, marginBottom: 200 }} // Approximate height for action bar + bottom bar
            onPress={closeActions}
            testID="actionBarOverlay"
          />
        </View>
      </Modal>

      {/* Eye button modal */}
      <Modal
        visible={showPrevCardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPrevCardModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPrevCardModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Last Action</Text>
            </View>

            {lastAction ? (
              <View
                style={[
                  styles.modalCardContent,
                  { backgroundColor: getActionColor(lastAction.type) },
                ]}
              >
                <Text style={styles.modalCardSender}>{lastAction.transaction.sender}</Text>
                <Text style={styles.modalCardBody}>{lastAction.transaction.body}</Text>
                <Text style={styles.modalCardAmount}>
                  {lastAction.transaction.amount
                    ? `₹${Math.abs(lastAction.transaction.amount).toLocaleString('en-IN')}`
                    : '—'}
                </Text>
                <Text style={styles.modalCardTime}>
                  {new Date(lastAction.transaction.timestamp * 1000).toLocaleString()}
                </Text>
                <View style={styles.modalActionBadge}>
                  <Text style={styles.modalActionText}>
                    {getActionLabel(lastAction.type)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.modalEmptyState}>
                <Ionicons name="layers-outline" size={64} color="#9CA3AF" />
                <Text style={styles.modalEmptyText}>No previous action to show</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  emptyStateContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120, // Space for animation above
    paddingHorizontal: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_700Bold',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  viewSummaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  viewSummaryButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxHeight: '70%',
    borderRadius: 24,
    backgroundColor: colors.bg,
    padding: spacing.xl + spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_700Bold',
  },
  modalCardContent: {
    padding: spacing.xl,
    borderRadius: 16,
    marginTop: spacing.md,
  },
  modalCardSender: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalCardBody: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalCardAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalCardTime: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_400Regular' }) || 'sans-serif',
  },
  modalActionBadge: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  modalEmptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  actionBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  actionBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  actionBarWrapper: {
    backgroundColor: colors.bg,
  },
});

export default ReviewScreen;
