import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radii, typography } from '../theme/tokens';

const BottomBar = ({ onSummaryPress, onActionsToggle, actionsOpen }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onSummaryPress}
        testID="bottomSummaryBtn"
        accessibilityLabel="Go to summary"
        accessibilityRole="button"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="stats-chart-outline" size={20} color={colors.primary} />
        <Text style={styles.buttonText}>Summary</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.actionsButton, actionsOpen && styles.actionsButtonActive]}
        onPress={onActionsToggle}
        testID="bottomActionsToggleBtn"
        accessibilityLabel={actionsOpen ? 'Hide actions' : 'Show actions'}
        accessibilityRole="button"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={actionsOpen ? 'close-outline' : 'grid-outline'}
          size={20}
          color={actionsOpen ? colors.bg : colors.primary}
        />
        <Text style={[styles.buttonText, actionsOpen && styles.actionsButtonTextActive]}>
          Actions
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
    gap: spacing.sm,
    minHeight: 48,
  },
  actionsButton: {
    backgroundColor: colors.primarySoft,
    marginLeft: spacing.md,
  },
  actionsButtonActive: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.body,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  actionsButtonTextActive: {
    color: colors.bg,
  },
});

export default BottomBar;

