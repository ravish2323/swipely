import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import spacing from '../../theme/spacing';

const DatabaseCard = ({
  onClear,
  onReset,
  marginBottom = spacing.xxl,
  padding = spacing.xl,
}) => {
  return (
    <View style={[styles.card, { marginBottom, padding }]}> 
      <Text style={styles.title}>Database Management</Text>
      <Text style={styles.description}>
        Manage your transaction data. Use with caution as these actions cannot be undone.
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={onClear}>
          <Text style={styles.buttonText}>Clear Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
          <Text style={styles.buttonText}>Reset Database</Text>
        </TouchableOpacity>
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
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.lg,
    lineHeight: 20,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  clearButton: {
    backgroundColor: '#ffe6e6',
  },
  resetButton: {
    backgroundColor: '#fff5d9',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
});

export default DatabaseCard;
