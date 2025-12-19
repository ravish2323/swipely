import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import spacing from '../../theme/spacing';

const FilterBar = ({
  activeFilter,
  onFilterChange,
  onScan,
  paddingHorizontal = spacing.xl,
  paddingTop = spacing.lg,
  paddingBottom = spacing.md,
}) => {
  const handlePress = async (value) => {
    onFilterChange(value);
    await onScan();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal,
          paddingTop,
          paddingBottom,
        },
      ]}
    >
      <View style={styles.row}>
        {['today', 'week', 'month'].map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => handlePress(filter)}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  pill: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  pillActive: {
    backgroundColor: '#F0F4FF',
    borderColor: '#8B5CF6',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  pillTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});

export default FilterBar;
