import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

const FilterPills = ({ activeFilter, onFilterChange, filters = ['today', 'week', 'month'] }) => {
  const filterLabels = {
    today: 'Today',
    week: 'Week',
    month: 'Month',
  };

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onFilterChange(filter)}
              testID={`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
              accessibilityLabel={`Filter by ${filterLabels[filter]}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {filterLabels[filter]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  track: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
  },
  pill: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.primarySoft,
  },
  pillText: {
    ...typography.meta,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default FilterPills;
