import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/tokens';

const HeroTotalCard = ({ totalAmount, dateRange = 'Today' }) => {
  const formatAmount = (amount) => {
    if (!amount || amount === 0) return '₹0';
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Icon in corner */}
      <View style={styles.iconContainer}>
        <Ionicons name="wallet-outline" size={24} color={colors.primary} style={styles.icon} />
      </View>

      {/* Top row: Label + Range chip */}
      <View style={styles.topRow}>
        <Text style={styles.label}>Total Spent</Text>
        <View style={styles.rangeChip}>
          <Text style={styles.rangeChipText}>{dateRange}</Text>
        </View>
      </View>

      {/* Big amount */}
      <Text style={styles.amount}>{formatAmount(totalAmount)}</Text>

      {/* Bottom row: Optional metrics */}
      <View style={styles.bottomRow}>
        <Text style={styles.metricText}>Transactions processed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.card,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.08,
    top: -40,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    opacity: 0.06,
    bottom: -20,
    left: -20,
  },
  circle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    opacity: 0.05,
    top: '50%',
    right: 20,
  },
  iconContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    opacity: 0.3,
  },
  icon: {
    opacity: 0.4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.meta,
    color: colors.textSecondary,
    fontSize: 13,
  },
  rangeChip: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rangeChipText: {
    ...typography.meta,
    color: colors.textPrimary,
    fontSize: 11,
  },
  amount: {
    ...typography.title,
    fontSize: 42,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: Platform.select({ ios: 'System', android: 'SpaceGrotesk_600SemiBold' }) || 'sans-serif',
  },
  bottomRow: {
    marginTop: spacing.xs,
  },
  metricText: {
    ...typography.meta,
    color: colors.textSecondary,
    fontSize: 11,
  },
});

export default HeroTotalCard;

