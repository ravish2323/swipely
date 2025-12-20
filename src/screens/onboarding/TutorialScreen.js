import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const TutorialScreen = ({ onComplete }) => {
  const directions = [
    { icon: 'arrow-forward-outline', label: 'Confirm', color: colors.successBg },
    { icon: 'arrow-back-outline', label: 'Reject', color: colors.rejectBg },
    { icon: 'arrow-up-outline', label: 'Special', color: colors.specialBg },
    { icon: 'arrow-down-outline', label: 'Food', color: colors.foodBg },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How swiping works</Text>
        <Text style={styles.subtitle}>
          Swipe cards in different directions to categorize transactions
        </Text>

        <View style={styles.directionsContainer}>
          {directions.map((dir, index) => (
            <View key={index} style={[styles.directionChip, { backgroundColor: dir.color }]}>
              <Ionicons name={dir.icon} size={24} color={colors.textPrimary} />
              <Text style={styles.directionLabel}>{dir.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onComplete}
        testID="onboardingStart"
        accessibilityLabel="Start reviewing"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Start Reviewing</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  directionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  directionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    gap: spacing.sm,
    minWidth: 120,
    justifyContent: 'center',
  },
  directionLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.button,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    ...typography.body,
    fontSize: 16,
    color: colors.bg,
    fontWeight: '600',
  },
});

export default TutorialScreen;

