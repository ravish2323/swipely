import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import {
  getSummaryStats,
  getTransactionsByStatus,
  getTransactionsByCategory,
} from '../services/database';
import { exportToCSV, exportToPDF, getDateRange } from '../services/exportService';
import SMSService from '../services/smsService';

const SummaryScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [confirmedTransactions, setConfirmedTransactions] = useState([]);
  const [foodTransactions, setFoodTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const summaryStats = await getSummaryStats();
      const confirmed = await getTransactionsByStatus('confirmed');
      const food = await getTransactionsByCategory('food');
      
      setStats(summaryStats);
      setConfirmedTransactions(confirmed.slice(0, 10));
      setFoodTransactions(food.slice(0, 10));
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

  const handleExport = async (format) => {
    try {
      setShowExportModal(false);
      const dateRange = getDateRange(dateFilter, customStartDate, customEndDate);
      
      if (format === 'csv') {
        await exportToCSV(null, dateRange);
        Alert.alert('Success', 'Transactions exported to CSV!');
      } else if (format === 'pdf') {
        await exportToPDF(null, dateRange);
        Alert.alert('Success', 'Transactions exported!');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('Error', 'Failed to export: ' + error.message);
    }
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
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Summary</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowDateFilter(!showDateFilter)}
            >
              <Text style={styles.headerButtonText}>📅 Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowExportModal(true)}
            >
              <Text style={styles.headerButtonText}>📥 Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.scanButton]}
              onPress={handleScan}
              disabled={scanning}
            >
              <Text style={styles.headerButtonText}>
                {scanning ? '⏳' : '📱'} Scan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Filter Dropdown */}
        {showDateFilter && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, dateFilter === 'all' && styles.filterChipActive]}
                onPress={() => setDateFilter('all')}
              >
                <Text style={[styles.filterChipText, dateFilter === 'all' && styles.filterChipTextActive]}>
                  All Time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, dateFilter === 'today' && styles.filterChipActive]}
                onPress={() => setDateFilter('today')}
              >
                <Text style={[styles.filterChipText, dateFilter === 'today' && styles.filterChipTextActive]}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, dateFilter === 'week' && styles.filterChipActive]}
                onPress={() => setDateFilter('week')}
              >
                <Text style={[styles.filterChipText, dateFilter === 'week' && styles.filterChipTextActive]}>
                  This Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, dateFilter === 'month' && styles.filterChipActive]}
                onPress={() => setDateFilter('month')}
              >
                <Text style={[styles.filterChipText, dateFilter === 'month' && styles.filterChipTextActive]}>
                  This Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, dateFilter === 'custom' && styles.filterChipActive]}
                onPress={() => setDateFilter('custom')}
              >
                <Text style={[styles.filterChipText, dateFilter === 'custom' && styles.filterChipTextActive]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, styles.confirmedCard]}>
              <Text style={styles.summaryCardTitle}>Confirmed</Text>
              <Text style={styles.summaryCardValue}>{stats.confirmed.count}</Text>
              <Text style={styles.summaryCardAmount}>
                {formatAmount(stats.confirmed.total)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.foodCard]}>
              <Text style={styles.summaryCardTitle}>🍔 Food</Text>
              <Text style={styles.summaryCardValue}>{stats.food.count}</Text>
              <Text style={styles.summaryCardAmount}>
                {formatAmount(stats.food.total)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.rejectedCard]}>
              <Text style={styles.summaryCardTitle}>Rejected</Text>
              <Text style={styles.summaryCardValue}>{stats.rejected.count}</Text>
              <Text style={styles.summaryCardSubtext}>Not tracked</Text>
            </View>

            <View style={[styles.summaryCard, styles.specialCard]}>
              <Text style={styles.summaryCardTitle}>Special</Text>
              <Text style={styles.summaryCardValue}>{stats.special.count}</Text>
              <Text style={styles.summaryCardAmount}>
                {formatAmount(stats.special.total)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.pendingCard]}>
              <Text style={styles.summaryCardTitle}>Pending</Text>
              <Text style={styles.summaryCardValue}>{stats.pending.count}</Text>
              <Text style={styles.summaryCardSubtext}>Awaiting review</Text>
            </View>
          </View>

          {/* Recent Food Expenses */}
          {foodTransactions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍔 Recent Food Expenses</Text>
              {foodTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionSender}>{transaction.sender}</Text>
                    <Text style={styles.transactionBody} numberOfLines={1}>
                      {transaction.body}
                    </Text>
                    <Text style={styles.transactionTime}>
                      {new Date(transaction.timestamp * 1000).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.amount < 0 && styles.debitAmount,
                      ]}
                    >
                      {formatAmount(transaction.amount)}
                    </Text>
                    <View
                      style={[
                        styles.confidenceIndicator,
                        {
                          backgroundColor:
                            transaction.confidence > 0.7
                              ? '#10B981'
                              : transaction.confidence > 0.5
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      <Text style={styles.confidenceText}>
                        {Math.round(transaction.confidence * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recent Confirmed Transactions */}
          {confirmedTransactions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Confirmed Transactions</Text>
              {confirmedTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionSender}>{transaction.sender}</Text>
                    <Text style={styles.transactionBody} numberOfLines={1}>
                      {transaction.body}
                    </Text>
                    <Text style={styles.transactionTime}>
                      {new Date(transaction.timestamp * 1000).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.amount < 0 && styles.debitAmount,
                      ]}
                    >
                      {formatAmount(transaction.amount)}
                    </Text>
                    <View
                      style={[
                        styles.confidenceIndicator,
                        {
                          backgroundColor:
                            transaction.confidence > 0.7
                              ? '#10B981'
                              : transaction.confidence > 0.5
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      <Text style={styles.confidenceText}>
                        {Math.round(transaction.confidence * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Transactions Processed:</Text>
              <Text style={styles.statValue}>
                {stats.confirmed.count + stats.rejected.count + stats.special.count}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Amount Tracked:</Text>
              <Text style={styles.statValue}>
                {formatAmount(stats.confirmed.total + stats.special.total)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Confidence:</Text>
              <Text style={styles.statValue}>
                {confirmedTransactions.length > 0
                  ? Math.round(
                      (confirmedTransactions.reduce(
                        (sum, t) => sum + (t.confidence || 0),
                        0
                      ) /
                        confirmedTransactions.length) *
                        100
                    )
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Transactions</Text>
            <Text style={styles.modalSubtitle}>
              Choose export format for {dateFilter === 'all' ? 'all transactions' : dateFilter}
            </Text>
            
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('csv')}
            >
              <Text style={styles.exportButtonIcon}>📊</Text>
              <View style={styles.exportButtonTextContainer}>
                <Text style={styles.exportButtonTitle}>Export as Excel (CSV)</Text>
                <Text style={styles.exportButtonSubtitle}>Open in Excel, Google Sheets</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('pdf')}
            >
              <Text style={styles.exportButtonIcon}>📄</Text>
              <View style={styles.exportButtonTextContainer}>
                <Text style={styles.exportButtonTitle}>Export as Report (TXT)</Text>
                <Text style={styles.exportButtonSubtitle}>Text-based report format</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scanButton: {
    backgroundColor: '#6366F1',
  },
  headerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterContainer: {
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmedCard: {
    backgroundColor: '#10B981',
  },
  foodCard: {
    backgroundColor: '#F59E0B',
  },
  rejectedCard: {
    backgroundColor: '#EF4444',
  },
  specialCard: {
    backgroundColor: '#3B82F6',
  },
  pendingCard: {
    backgroundColor: '#8B5CF6',
  },
  summaryCardTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 6,
    fontWeight: '600',
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  summaryCardAmount: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryCardSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionLeft: {
    flex: 1,
    marginRight: 12,
  },
  transactionSender: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  transactionBody: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  transactionTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 6,
  },
  debitAmount: {
    color: '#EF4444',
  },
  confidenceIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exportButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  exportButtonTextContainer: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  exportButtonSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalCloseButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default SummaryScreen;
