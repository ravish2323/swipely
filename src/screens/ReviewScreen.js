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
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwipeCard from '../components/SwipeCard';
import ScreenShell from '../components/ScreenShell';
import {
  getPendingTransactions,
  updateTransactionStatus,
  updateTransactionCategory,
} from '../services/database';
import SMSService from '../services/smsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        Alert.alert('Success', 'SMS scanning completed!');
        setTimeout(() => {
          loadTransactions(false);
        }, 1000);
      } else {
        Alert.alert('Permission Required', 'Please grant SMS permission to scan for transactions.');
      }
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

  const remainingCount = filteredTransactions.length;

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.splashContainer}>
          <View style={styles.splashContent}>
            <Ionicons name="flash" size={64} color="#8B5CF6" />
            <Text style={styles.splashTitle}>Swipe your expenses into control</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = filteredTransactions[0];
  const remainingCount = filteredTransactions.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AnimatedNavigationWrapper
        style={styles.container}
        onSwipeLeft={() => navigation.navigate('Summary')}
        onSwipeRight={() => navigation.navigate('Summary')}
        edgeActivationWidth={32}
      >
        {/* Purple Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Review</Text>
        </View>

        {/* Filter Row (White Background) */}
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.dateFilterPill, dateFilter === 'today' && styles.dateFilterPillActive]}
              onPress={() => {
                setDateFilter('today');
              }}
            >
              <Text style={[styles.dateFilterPillText, dateFilter === 'today' && styles.dateFilterPillTextActive]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateFilterPill, dateFilter === 'week' && styles.dateFilterPillActive]}
              onPress={() => {
                setDateFilter('week');
              }}
            >
              <Text style={[styles.dateFilterPillText, dateFilter === 'week' && styles.dateFilterPillTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateFilterPill, dateFilter === 'month' && styles.dateFilterPillActive]}
              onPress={() => {
                setDateFilter('month');
              }}
            >
              <Text style={[styles.dateFilterPillText, dateFilter === 'month' && styles.dateFilterPillTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateFilterPill, dateFilter === 'all' && styles.dateFilterPillActive]}
              onPress={async () => {
                setDateFilter('all');
                // Auto-scan when filter is clicked
                await handleScan();
              }}
            >
              <Text style={[styles.dateFilterPillText, dateFilter === 'all' && styles.dateFilterPillTextActive]}>
                All
              </Text>
            </TouchableOpacity>
          </View>

    const currentCard = filteredTransactions[0];

    return (
      <>
        <View style={styles.cardStage}>
          {filteredTransactions.length === 0 ? (
            <Animated.View
              style={[
                styles.emptyContainer,
                {
                  transform: [{ translateX: emptyStateSwipePosition.x }],
                },
              ]}
              {...emptyStatePanResponder.panHandlers}
            >
              <Animated.View
                style={[
                  styles.starContainer,
                  {
                    transform: [
                      { scale: starScale },
                      { 
                        rotate: starRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="star-outline" size={72} color="#B794F6" />
              </Animated.View>
              
              <Animated.View
                style={[
                  styles.emptyTextContainer,
                  {
                    opacity: textOpacity,
                    transform: [{ scale: textScale }],
                  },
                ]}
              >
                <Text style={styles.emptyTitle}>All Done!</Text>
                <Text style={styles.emptyText}>
                  You've processed all transactions for this period.
                </Text>
              </Animated.View>
            </View>
          ) : (
            <>
              {currentCard && (
                <SwipeCard
                  key={currentCard.id}
                  transaction={currentCard}
                  onSwipe={handleSwipe}
                  index={0}
                  showAmount={true}
                  showActionButtons={showActionButtons}
                  onToggleActionButtons={() => setShowActionButtons(!showActionButtons)}
                />
              )}
            </>
          )}
          
          {transactions.length > 0 && (
            <View style={styles.eyeButtonContainer}>
              <Animated.View
                style={[
                  styles.draggableEyeButton,
                  {
                    transform: [
                      { translateX: eyeButtonPosition.x },
                      { translateY: eyeButtonPosition.y },
                    ],
                  },
                ]}
                {...eyeButtonPanResponder.panHandlers}
              >
              <TouchableOpacity
                style={styles.eyeButtonInner}
                onPressIn={handleEyeButtonPressIn}
                onPressOut={handleEyeButtonPressOut}
                delayPressIn={0}
                activeOpacity={0.7}
              >
                <Ionicons name="eye" size={26} color="#8B5CF6" />
              </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          
        {filteredTransactions.length === 0 && transactions.length === 0 && !loading && (
            <Animated.View 
              style={[
                styles.completionAnimation,
                {
                  opacity: completionOpacity,
                  transform: [{ scale: completionScale }],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              <Text style={styles.completionText}>All Done!</Text>
            </Animated.View>
          )}
        </View>

        {filteredTransactions.length > 0 && showActionButtons && (
          <TouchableOpacity
            style={styles.actionBarOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowActionButtons(false);
            }}
          >
            <View 
              style={styles.bottomActionBar} 
              onStartShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
            >
              <TouchableOpacity
                style={[styles.actionPill, styles.rejectPill]}
                onPress={() => {
                  handleManualAction('rejected', null, 'reject');
                  setShowActionButtons(false);
                }}
              >
                <Ionicons name="close-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionPill, styles.favoritePill]}
                onPress={() => {
                  handleManualAction('special', null, 'favorite');
                  setShowActionButtons(false);
                }}
              >
                <Ionicons name="star-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionPill, styles.foodPill]}
                onPress={() => {
                  handleManualAction('confirmed', 'food', 'food');
                  setShowActionButtons(false);
                }}
              >
                <Ionicons name="restaurant-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionPill, styles.confirmPill]}
                onPress={() => {
                  handleManualAction('confirmed', null, 'confirm');
                  setShowActionButtons(false);
                }}
              >
                <Ionicons name="checkmark-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Bottom Info Bar */}
        {!showActionButtons && (
          <View style={styles.bottomInfoBar}>
            <View style={styles.bottomInfoLeft}>
              {filteredTransactions.length > 0 ? (
                <Text style={styles.cardsRemainingText}>
                  {remainingCount} {remainingCount === 1 ? 'card' : 'cards'} remaining
                </Text>
              ) : transactions.length > 0 ? (
                <Text style={styles.cardsRemainingText}>
                  No cards in this filter
                </Text>
              ) : (
                <Text style={styles.cardsRemainingText}>
                  All cards processed
                </Text>
              )}
            </View>
            <View style={styles.bottomInfoRight}>
              <TouchableOpacity
                style={styles.summaryButton}
                onPress={() => navigation.navigate('Summary')}
              >
                <Text style={styles.summaryButtonText}>Summary</Text>
              </TouchableOpacity>
              {filteredTransactions.length > 0 && (
                <TouchableOpacity
                  style={styles.starButton}
                  onPress={() => setShowActionButtons(true)}
                >
                  <Ionicons name="star-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

  const bottomInfo = !showActionButtons ? (
    <View style={styles.bottomInfoBar}>
      <View style={styles.bottomInfoLeft}>
        {filteredTransactions.length > 0 ? (
          <Text style={styles.cardsRemainingText}>
            {remainingCount} {remainingCount === 1 ? 'card' : 'cards'} remaining
          </Text>
        ) : (
          <Text style={styles.cardsRemainingText}>
            All cards processed
          </Text>
        )}
      </View>
      <View style={styles.bottomInfoRight}>
        <TouchableOpacity
          style={styles.summaryButton}
          onPress={() => navigation.navigate('Summary')}
        >
          <Text style={styles.summaryButtonText}>Summary</Text>
        </TouchableOpacity>
        {filteredTransactions.length > 0 && (
          <TouchableOpacity
            style={styles.starButton}
            onPress={() => setShowActionButtons(true)}
          >
            <Ionicons name="star-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ) : null;

  return (
    <ScreenShell
      title="Today's Inbox"
      topSlot={(
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.dateFilterPill, dateFilter === 'today' && styles.dateFilterPillActive]}
              onPress={async () => {
                setDateFilter('today');
                await handleScan();
              }}
            >
              <Text style={[styles.dateFilterPillText, dateFilter === 'today' && styles.dateFilterPillTextActive]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateFilterPill, dateFilter === 'week' && styles.dateFilterPillActive]}
              onPress={async () => {
                setDateFilter('week');
                await handleScan();
              }}
            >
              <Text style={[styles.dateFilterPillText, dateFilter === 'week' && styles.dateFilterPillTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateFilterPill, dateFilter === 'month' && styles.dateFilterPillActive]}
              onPress={async () => {
                setDateFilter('month');
                await handleScan();
              }}
            >
              <Text style={[styles.dateFilterPillText, dateFilter === 'month' && styles.dateFilterPillTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      )}
      bottomSlot={bottomInfo}
    >
      {renderContent()}
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
    marginTop: 24,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    paddingHorizontal: 40,
    letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_700Bold' }) || 'sans-serif',
  },
  splashLoader: {
    marginTop: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#8B5CF6', // Purple
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 0 : 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : Platform.select({ android: 'Inter_600SemiBold' }) || 'sans-serif',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dateFilterPill: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  dateFilterPillActive: {
    backgroundColor: '#F0F4FF',
    borderColor: '#8B5CF6',
  },
  dateFilterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_500Medium' }) || 'sans-serif-medium',
  },
  dateFilterPillTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_600SemiBold' }) || 'sans-serif',
  },
  cardStage: {
    flex: 1,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  eyeButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  draggableEyeButton: {
    width: 52,
    height: 52,
  },
  eyeButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eyeIconBold: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  starContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_700Bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_400Regular' }) || 'sans-serif',
  },
  actionBarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectPill: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  favoritePill: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1.5,
    borderColor: '#A5B4FC',
  },
  foodPill: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  confirmPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  bottomInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bottomInfoLeft: {
    flex: 1,
  },
  bottomInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardsRemainingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_500Medium' }) || 'sans-serif-medium',
  },
  summaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  summaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_600SemiBold' }) || 'sans-serif',
  },
  starButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    maxHeight: '70%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_700Bold',
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
    paddingTop: 12,
  },
  modalCardSender: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalCardBody: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalCardAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalCardTime: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_400Regular' }) || 'sans-serif',
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ReviewScreen;
