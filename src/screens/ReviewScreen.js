import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import SwipeCard from '../components/SwipeCard';
import {
  getPendingTransactions,
  updateTransactionStatus,
  updateTransactionCategory,
  clearAllTransactions,
  resetDatabase,
} from '../services/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReviewScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreviousAmounts, setShowPreviousAmounts] = useState(false);
  const [showBottomSettings, setShowBottomSettings] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);

  const loadTransactions = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('Loading pending transactions...');
      const pending = await getPendingTransactions();
      console.log(`Found ${pending.length} pending transactions`);
      setTransactions(pending);
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
  }, []);

  useEffect(() => {
    loadTransactions(true);
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions(true);
    });
    
    return () => {
      unsubscribe();
    };
  }, [navigation, loadTransactions]);

  const handleSwipe = async (id, status, category = null) => {
    try {
      await updateTransactionStatus(id, status);
      if (category) {
        await updateTransactionCategory(id, category);
      }
      
      const newTransactions = transactions.filter(t => t.id !== id);
      setTransactions(newTransactions);
      
      if (newTransactions.length === 0) {
        setTimeout(() => {
          loadTransactions(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  const handleManualAction = async (status, category = null) => {
    if (transactions.length === 0) return;
    
    const current = transactions[0];
    await handleSwipe(current.id, status, category);
  };

  const handleClearTransactions = useCallback(() => {
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
              loadTransactions(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear transactions: ' + error.message);
            }
          },
        },
      ]
    );
  }, [loadTransactions]);

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
              loadTransactions(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to reset database: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const formatAmount = (amount) => {
    if (!amount) return '—';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '+';
    return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
  };

  // Set header options for clear button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClearTransactions}
        >
          <Text style={styles.headerButtonText}>🗑️</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleClearTransactions]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (transactions.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🎉 All caught up!</Text>
          <Text style={styles.emptyText}>
            You've reviewed all pending transactions.
          </Text>
          <TouchableOpacity
            style={styles.summaryButton}
            onPress={() => navigation.navigate('Summary')}
          >
            <Text style={styles.summaryButtonText}>View Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadTransactions}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get cards to display (current + up to 3 previous)
  const visibleCards = transactions.slice(0, 4);
  const currentCard = transactions[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Toggle Button */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, showPreviousAmounts && styles.toggleButtonActive]}
            onPress={() => setShowPreviousAmounts(!showPreviousAmounts)}
          >
            <Text style={[styles.toggleText, showPreviousAmounts && styles.toggleTextActive]}>
              {showPreviousAmounts ? '👁️ Hide' : '👁️ Show'} Previous Amounts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cards Stack */}
        <View style={styles.cardsContainer}>
          {visibleCards.map((transaction, index) => {
            if (index === 0) {
              // Current card - fully interactive
              return (
                <SwipeCard
                  key={transaction.id}
                  transaction={transaction}
                  onSwipe={handleSwipe}
                  index={index}
                  showAmount={true}
                />
              );
            } else {
              // Previous cards - stacked behind
              const offset = index * 8;
              const scale = 1 - (index * 0.03);
              const opacity = 1 - (index * 0.15);
              
              return (
                <View
                  key={transaction.id}
                  style={[
                    styles.previousCard,
                    {
                      transform: [
                        { translateY: offset },
                        { scale },
                      ],
                      opacity,
                      zIndex: -index,
                    },
                  ]}
                >
                  <View style={styles.previousCardContent}>
                    <View style={styles.previousCardHeader}>
                      <Text style={styles.previousCardSender} numberOfLines={1}>
                        {transaction.sender}
                      </Text>
                      {showPreviousAmounts && (
                        <Text style={styles.previousCardAmount}>
                          {formatAmount(transaction.amount)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.previousCardBody} numberOfLines={2}>
                      {transaction.body}
                    </Text>
                  </View>
                </View>
              );
            }
          })}
        </View>

        {/* Action Buttons - Toggleable */}
        {showActionButtons && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleManualAction('rejected')}
            >
              <Text style={styles.actionButtonText}>✕</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.specialButton]}
              onPress={() => handleManualAction('special')}
            >
              <Text style={styles.actionButtonText}>★</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.foodButton]}
              onPress={() => handleManualAction('confirmed', 'food')}
            >
              <Text style={styles.actionButtonText}>🍔</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleManualAction('confirmed')}
            >
              <Text style={styles.actionButtonText}>✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.statsText}>
            {transactions.length} {transactions.length === 1 ? 'card' : 'cards'} remaining
          </Text>
          <TouchableOpacity
            style={styles.summaryLink}
            onPress={() => navigation.navigate('Summary')}
          >
            <Text style={styles.summaryLinkText}>Summary</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Action Buttons Button */}
        <TouchableOpacity
          style={[
            styles.actionToggleButton,
            {
              bottom: showActionButtons
                ? showBottomSettings
                  ? 200
                  : 140
                : showBottomSettings
                ? 200
                : 80,
            },
          ]}
          onPress={() => setShowActionButtons(!showActionButtons)}
        >
          <Text style={styles.actionToggleIcon}>
            {showActionButtons ? '▼' : '☰'}
          </Text>
        </TouchableOpacity>

        {/* Settings Toggle Button */}
        <TouchableOpacity
          style={[
            styles.settingsToggleButton,
            {
              bottom: showBottomSettings
                ? showActionButtons
                  ? 200
                  : 140
                : showActionButtons
                ? 140
                : 16,
            },
          ]}
          onPress={() => setShowBottomSettings(!showBottomSettings)}
        >
          <Text style={styles.settingsToggleIcon}>
            {showBottomSettings ? '▼' : '⚙️'}
          </Text>
        </TouchableOpacity>

        {/* Settings Panel */}
        {showBottomSettings && (
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleClearTransactions}
            >
              <Text style={styles.settingsButtonText}>🗑️ Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingsButton, styles.resetButton]}
              onPress={handleResetDatabase}
            >
              <Text style={styles.settingsButtonText}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
  headerButtonText: {
    fontSize: 20,
  },
  toggleContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  toggleButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  previousCard: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    maxHeight: 200,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  previousCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  previousCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previousCardSender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  previousCardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  previousCardBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  specialButton: {
    backgroundColor: '#3B82F6',
  },
  foodButton: {
    backgroundColor: '#F59E0B',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  footerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryLink: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  summaryLinkText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  actionToggleButton: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  actionToggleIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  settingsToggleButton: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  settingsToggleIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  settingsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  settingsButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ReviewScreen;
