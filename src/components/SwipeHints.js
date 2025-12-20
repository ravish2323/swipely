import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

const SwipeHints = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.hintText}>
        ← Reject   ↑ Special   ↓ Food   → Confirm
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  hintText: {
    ...typography.meta,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SwipeHints;

