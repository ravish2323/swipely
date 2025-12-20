import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';

const PendingBanner = ({ pendingCount, onPress }) => {
  if (pendingCount === 0) return null;

  return (
    <View style={[styles.banner, shadows.card]}>
      <View style={styles.content}>
        <Ionicons name="time-outline" size={24} color={colors.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{pendingCount} awaiting review</Text>
          <Text style={styles.subtitle}>Swipe to categorize transactions</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        testID="pendingCta"
        accessibilityLabel="Go to review screen"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Review</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.meta,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.button,
  },
  buttonText: {
    ...typography.body,
    color: colors.bg,
    fontWeight: '600',
  },
});

export default PendingBanner;

