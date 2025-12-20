import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

const ManagementCard = ({ onClear, onReset }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Database Management</Text>
      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={onClear}
        accessibilityLabel="Clear all transactions"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Clear All Transactions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={onReset}
        accessibilityLabel="Reset database"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, styles.resetButtonText]}>Reset Database</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: colors.rejectBg,
  },
  resetButton: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resetButtonText: {
    color: colors.textSecondary,
  },
});

export default ManagementCard;

