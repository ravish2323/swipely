import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwipeCard from '../components/SwipeCard';
import ScreenShell from '../components/ScreenShell';
import FilterBar from '../components/review/FilterBar';
import BottomBar from '../components/review/BottomBar';
import CardStage from '../components/review/CardStage';
import StarCelebration from '../components/review/StarCelebration';
import EyeButtonWithCount from '../components/review/EyeButtonWithCount';
import {
  getPendingTransactions,
  updateTransactionStatus,
  updateTransactionCategory,
} from '../services/database';
import SMSService from '../services/smsService';
import spacing from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReviewScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [showPrevCardModal, setShowPrevCardModal] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Star animation for completion
  const starScale = useRef(new Animated.Value(0)).current;
  const starRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;

  // Hide action buttons when all cards are processed
  useEffect(() => {
    if (filteredTransactions.length === 0 && showActionButtons) {
      setShowActionButtons(false);
    }
  }, [filteredTransactions.length, showActionButtons]);

  // Completion animation trigger
  useEffect(() => {
    const shouldShowEmpty = filteredTransactions.length === 0 && transactions.length === 0;
    if (shouldShowEmpty) {
      // Trigger StarCelebration animation via autoStart prop
      starScale.setValue(0);
      starRotation.setValue(0);
      textOpacity.setValue(0);
      textScale.setValue(0.8);
    }
  }, [filteredTransactions.length, transactions.length, starScale, starRotation, textOpacity, textScale]);

  const loadTransactions = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const pending = await getPendingTransactions();
      setTransactions(pending);
      applyDateFilter(pending, dateFilter);
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
      return;
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
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const filtered = txns.filter(t => t.timestamp >= startTimestamp);
    setFilteredTransactions(filtered);
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
    applyDateFilter(transactions, dateFilter);
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

      await updateTransactionStatus(id, status);
      if (category) {
        await updateTransactionCategory(id, category);
      }
      
      const newTransactions = transactions.filter(t => t.id !== id);
      setTransactions(newTransactions);
      applyDateFilter(newTransactions, dateFilter);
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  const handleManualAction = async (status, category = null, actionType = null) => {
    if (filteredTransactions.length === 0) return;
    const current = filteredTransactions[0];
    await handleSwipe(current.id, status, category, actionType);
  };


  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'reject': return '#ffe6e6';
      case 'favorite': return '#edf0ff';
      case 'food': return '#fff5d9';
      case 'confirm': return '#e8f7f0';
      default: return '#FFFFFF';
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

  // Eye button - show on press, hide on release
  const handleEyeButtonPressIn = () => {
    setShowPrevCardModal(true);
  };
  
  const handleEyeButtonPressOut = () => {
    setShowPrevCardModal(false);
  };

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashContent}>
          <Ionicons name="flash" size={64} color="#8B5CF6" />
          <Text style={styles.splashTitle}>Swipe your expenses into control</Text>
        </View>
      </View>
    );
  }

  const currentCard = filteredTransactions[0];
  const remainingCount = filteredTransactions.length;
  const hasCards = filteredTransactions.length > 0;

  // Render empty state with navigation - single star animation
  const renderEmptyState = () => {
    if (filteredTransactions.length === 0 && transactions.length === 0) {
      return (
        <StarCelebration
          title="All Done!"
          subtitle="You've processed all transactions for this period."
          autoStart={true}
          onAnimationComplete={() => {
            setTimeout(() => {
              navigation.navigate('Summary');
            }, 1500);
          }}
        />
      );
    }
    return null;
  };

  // Render eye button with cards count - pinned top-right
  const renderEyeButton = () => {
    if (transactions.length > 0) {
      return (
        <EyeButtonWithCount
          remainingCount={remainingCount}
          hasCards={hasCards}
          onPressIn={handleEyeButtonPressIn}
          onPressOut={handleEyeButtonPressOut}
        />
      );
    }
    return null;
  };

  return (
    <ScreenShell
      title="Review"
      topSlot={
        <FilterBar
          activeFilter={dateFilter}
          onFilterChange={setDateFilter}
          onScan={async () => {
            // Auto-scan on filter change
            try {
              await SMSService.initialize();
              if (SMSService.hasPermission && SMSService.loadRecentSMS) {
                await SMSService.loadRecentSMS();
                loadTransactions(false);
              }
            } catch (error) {
              console.error('Error scanning SMS:', error);
            }
          }}
        />
      }
      bottomSlot={
        <BottomBar
          showActionButtons={showActionButtons}
          hasCards={hasCards}
          onCloseActions={() => setShowActionButtons(false)}
          onReject={() => handleManualAction('rejected', null, 'reject')}
          onFavorite={() => handleManualAction('special', null, 'favorite')}
          onFood={() => handleManualAction('confirmed', 'food', 'food')}
          onConfirm={() => handleManualAction('confirmed', null, 'confirm')}
          onSummaryPress={() => navigation.navigate('Summary')}
          onOpenActions={() => setShowActionButtons(true)}
        />
      }
    >
      <CardStage
        hasCards={hasCards}
        renderCard={() => (
          currentCard && (
            <SwipeCard
              key={currentCard.id}
              transaction={currentCard}
              onSwipe={handleSwipe}
              index={0}
              showAmount={true}
              showActionButtons={showActionButtons}
              onToggleActionButtons={() => setShowActionButtons(!showActionButtons)}
            />
          )
        )}
        renderEmptyState={renderEmptyState}
        renderEyeButton={renderEyeButton}
      />

      {/* Eye button modal showing last action */}
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
              <View style={[
                styles.modalCardContent,
                { backgroundColor: getActionColor(lastAction.type) }
              ]}>
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
    backgroundColor: '#FFFFFF',
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    marginTop: spacing.xxl,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    paddingHorizontal: spacing.xl * 2,
    letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_700Bold' }) || 'sans-serif',
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
    backgroundColor: '#FFFFFF',
    padding: spacing.xl + spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
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
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  modalCardBody: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalCardAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  modalCardTime: {
    fontSize: 13,
    color: '#9CA3AF',
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
    color: '#1A1A1A',
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default ReviewScreen;
