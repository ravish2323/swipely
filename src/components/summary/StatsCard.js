import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import spacing from '../../theme/spacing';

const StatsCard = ({
  stats,
  formatAmount,
  marginBottom = spacing.xxl,
  padding = spacing.xl,
}) => {
  return (
    <View style={[styles.card, { marginBottom, padding }]}> 
      <Text style={styles.title}>Statistics</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Total Transactions Processed</Text>
        <Text style={styles.value}>
          {stats.confirmed.count + stats.rejected.count + stats.special.count}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total Amount Tracked</Text>
        <Text style={styles.value}>
          {formatAmount(stats.confirmed.total + stats.special.total)}
        </Text>
      </View>
      <View style={[styles.row, styles.lastRow]}>
        <Text style={styles.label}>Average Confidence</Text>
        <Text style={styles.value}>
          {stats.averageConfidence ? Math.round(stats.averageConfidence * 100) : 0}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md + spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});

export default StatsCard;
