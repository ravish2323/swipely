import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwipeCard from '../components/SwipeCard';
import ReviewHeader from '../components/review/ReviewHeader';
import FilterBar from '../components/review/FilterBar';
import CardStage from '../components/review/CardStage';
import BottomBar from '../components/review/BottomBar';
import {
  getPendingTransactions,
  updateTransactionStatus,
  updateTransactionCategory,
} from '../services/database';
import SMSService from '../services/smsService';
import spacing from '../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ReviewScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month, all
  const [scanning, setScanning] = useState(false);
  const [showPrevCardModal, setShowPrevCardModal] = useState(false);
  const [lastAction, setLastAction] = useState(null); // { type: 'reject'|'favorite'|'food'|'confirm', transaction: {...} }
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // Draggable eye button position - top right of card area
  const eyeButtonPosition = useRef(new Animated.ValueXY({
    x: SCREEN_WIDTH - 80,
    y: 0, // Top of card area
  })).current;
  
  // Completion animation
  const completionScale = useRef(new Animated.Value(0)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;
  
  // Star animation for empty state
  const starScale = useRef(new Animated.Value(0)).current;
  const starRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  
  // Swipe gesture for empty state to navigate to Summary
  const emptyStateSwipePosition = useRef(new Animated.ValueXY()).current;
  const emptyStatePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        emptyStateSwipePosition.setOffset({
          x: emptyStateSwipePosition.x._value,
          y: emptyStateSwipePosition.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        emptyStateSwipePosition.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        emptyStateSwipePosition.flattenOffset();
        
        if (gestureState.dx < -100) {
          // Swipe left - go to Summary
          Animated.timing(emptyStateSwipePosition, {
            toValue: { x: -SCREEN_WIDTH, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            navigation.navigate('Summary');
            setTimeout(() => {
              emptyStateSwipePosition.setValue({ x: 0, y: 0 });
            }, 100);
          });
        } else {
          // Return to center
          Animated.spring(emptyStateSwipePosition, {
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
    // Check if we should show empty state
    const shouldShowEmpty = filteredTransactions.length === 0 && transactions.length === 0;
    
    if (shouldShowEmpty) {
      // Reset animations
      starScale.setValue(0);
      starRotation.setValue(0);
      textOpacity.setValue(0);
      textScale.setValue(0.8);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        // One fluid star animation: rotate and scale together smoothly
        Animated.parallel([
          Animated.timing(starScale, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(starRotation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Smoothly settle to normal size while continuing rotation
          Animated.timing(starScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // After star animation, show text with pop effect
            Animated.parallel([
              Animated.timing(textOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(textScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
              }),
            ]).start();
            
            // Continuous fluid pulsing animation for star
            const animateStar = () => {
              Animated.sequence([
                Animated.timing(starScale, {
                  toValue: 1.1,
                  duration: 1500,
                  useNativeDriver: true,
                }),
                Animated.timing(starScale, {
                  toValue: 1,
                  duration: 1500,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                animateStar();
              });
            };
            animateStar();
          });
        });
      }, 100);
    } else {
      // Reset when cards appear
      starScale.setValue(0);
      starRotation.setValue(0);
      textOpacity.setValue(0);
      textScale.setValue(0.8);
    }
  }, [filteredTransactions.length, transactions.length]);

  const loadTransactions = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('Loading pending transactions...');
      const pending = await getPendingTransactions();
      console.log(`Found ${pending.length} pending transactions`);
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
      case 'all':
      default:
        setFilteredTransactions(txns);
        return;
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
      
      // Store last action for "Show Prev Card" modal
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
      
      // Apply filter to update filteredTransactions
      applyDateFilter(newTransactions, dateFilter);
      
      // Don't auto-navigate - let user use summary button
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

  const handleScan = async () => {
    try {
      setScanning(true);
      await SMSService.initialize();
      if (SMSService.hasPermission && SMSService.loadRecentSMS) {
        await SMSService.loadRecentSMS();
      }
      Alert.alert('Success', 'SMS scanning completed!');
      setTimeout(() => {
        loadTransactions(false);
      }, 1000);
    } catch (error) {
      console.error('Error scanning SMS:', error);
      Alert.alert('Error', 'Failed to scan SMS: ' + (error.message || 'Unknown error'));
    } finally {
      setScanning(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '—';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '+';
    return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'reject':
        return '#ffe6e6'; // Soft red
      case 'favorite':
        return '#edf0ff'; // Soft blue
      case 'food':
        return '#fff5d9'; // Soft yellow
      case 'confirm':
        return '#e8f7f0'; // Soft green
      default:
        return '#FFFFFF';
    }
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case 'reject':
        return 'Rejected';
      case 'favorite':
        return 'Favorited';
      case 'food':
        return 'Food';
      case 'confirm':
        return 'Confirmed';
      default:
        return 'Unknown';
    }
  };

  // Pan responder for draggable eye button - only X axis
  const eyeButtonPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to significant horizontal movement (not long press)
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: (evt) => {
        eyeButtonPosition.setOffset({
          x: eyeButtonPosition.x._value,
          y: eyeButtonPosition.y._value,
        });
        eyeButtonPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow X axis movement, keep Y fixed
        const maxX = SCREEN_WIDTH - 52;
        const newX = Math.max(0, Math.min(maxX, gestureState.dx));
        eyeButtonPosition.setValue({ x: newX, y: 0 });
      },
      onPanResponderRelease: () => {
        eyeButtonPosition.flattenOffset();
      },
    })
  ).current;
  
  // Long press timer for eye button - no delay
  const longPressTimer = useRef(null);
  
  const handleEyeButtonPressIn = () => {
    longPressTimer.current = setTimeout(() => {
      setShowPrevCardModal(true);
    }, 0); // No delay - immediate
  };
  
  const handleEyeButtonPressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.splashContainer}>
          <View style={styles.splashContent}>
            <Ionicons name="flash" size={64} color="#8B5CF6" />
            <Text style={styles.splashTitle}>Swipe your expenses into control</Text>
            <ActivityIndicator size="small" color="#8B5CF6" style={styles.splashLoader} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = filteredTransactions[0];
  const remainingCount = filteredTransactions.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ReviewHeader title=\"Today's Inbox\" paddingHorizontal={spacing.xl} />

        <FilterBar
          activeFilter={dateFilter}
          onFilterChange={setDateFilter}
          onScan={handleScan}
          paddingHorizontal={spacing.xl}
        />

        <CardStage
          filteredTransactions={filteredTransactions}
          transactionsLength={transactions.length}
          emptyStatePanHandlers={emptyStatePanResponder.panHandlers}
          emptyStateSwipeStyle={{ transform: [{ translateX: emptyStateSwipePosition.x }] }}
          starAnimatedStyle={{ transform: [{ scale: starScale }, { rotate: starRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}
          emptyTextAnimatedStyle={{ opacity: textOpacity, transform: [{ scale: textScale }] }}
          completionAnimatedStyle={{ opacity: completionOpacity, transform: [{ scale: completionScale }] }}
          eyeButtonPanHandlers={eyeButtonPanResponder.panHandlers}
          eyeButtonStyle={{ transform: [{ translateX: eyeButtonPosition.x }, { translateY: eyeButtonPosition.y }] }}
          onEyePressIn={handleEyeButtonPressIn}
          onEyePressOut={handleEyeButtonPressOut}
          showCompletion={!loading}
          paddingHorizontal={spacing.xl}
          paddingVertical={spacing.xl}
          renderCard={() => (
            currentCard ? (
              <SwipeCard
                key={currentCard.id}
                transaction={currentCard}
                onSwipe={handleSwipe}
                index={0}
                showAmount={true}
                showActionButtons={showActionButtons}
                onToggleActionButtons={() => setShowActionButtons(!showActionButtons)}
              />
            ) : null
          )}
        />

        <BottomBar
          showActionButtons={showActionButtons}
          hasCards={filteredTransactions.length > 0}
          remainingCount={remainingCount}
          onCloseActions={() => setShowActionButtons(false)}
          onReject={() => {
            handleManualAction('rejected', null, 'reject');
            setShowActionButtons(false);
          }}
          onFavorite={() => {
            handleManualAction('special', null, 'favorite');
            setShowActionButtons(false);
          }}
          onFood={() => {
            handleManualAction('confirmed', 'food', 'food');
            setShowActionButtons(false);
          }}
          onConfirm={() => {
            handleManualAction('confirmed', null, 'confirm');
            setShowActionButtons(false);
          }}
          onSummaryPress={() => navigation.navigate('Summary')}
          onOpenActions={() => setShowActionButtons(true)}
          paddingHorizontal={spacing.xl}
          paddingVertical={spacing.lg}
        />

        {/* Show Prev Card Modal */}
        <Modal
          visible={showPrevCardModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPrevCardModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              lastAction && { backgroundColor: getActionColor(lastAction.type) }
            ]}>
              {lastAction ? (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      Last Action: {getActionLabel(lastAction.type)}
                    </Text>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowPrevCardModal(false)}
                    >
                      <Text style={styles.modalCloseIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalCardContent}>
                    <Text style={styles.modalCardSender}>
                      {lastAction.transaction.sender}
                    </Text>
                    <Text style={styles.modalCardBody}>
                      {lastAction.transaction.body}
                    </Text>
                    <Text style={styles.modalCardAmount}>
                      {formatAmount(lastAction.transaction.amount)}
                    </Text>
                    <Text style={styles.modalCardTime}>
                      {new Date(lastAction.transaction.timestamp * 1000).toLocaleString()}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.modalEmptyState}>
                  <Ionicons name="archive-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.modalEmptyTitle}>Nothing to show yet</Text>
                  <Text style={styles.modalEmptyText}>
                    Start swiping cards to track your actions
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
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
  },
  splashLoader: {
    marginTop: spacing.xxl + spacing.sm,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  modalCardContent: {
    paddingTop: spacing.md,
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
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  modalEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.md,
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ReviewScreen;
