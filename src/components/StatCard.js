import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

const StatCard = ({ label, count, amount, backgroundColor = colors.bg, variant }) => {
  const isRejected = variant === 'rejected' || (!amount && label === 'Rejected');

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
      {isRejected ? (
        <Text style={styles.notTrackedText}>Not tracked</Text>
      ) : (
        amount !== undefined && amount !== null && (
          <Text style={styles.amount}>{amount}</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.lg,
    minHeight: 100,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.meta,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  count: {
    ...typography.h2,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.body,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  notTrackedText: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default StatCard;
