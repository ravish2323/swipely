import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../../theme/spacing';

const EyeButtonWithCount = ({
  remainingCount,
  hasCards,
  onPressIn,
  onPressOut,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <View style={styles.countSection}>
          {hasCards ? (
            <Text style={styles.countText}>
              {remainingCount} {remainingCount === 1 ? 'card' : 'cards'} remaining
            </Text>
          ) : (
            <Text style={styles.countText}>All cards processed</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.eyeButton}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.7}
        >
          <Ionicons name="eye" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
    zIndex: 10,
    paddingHorizontal: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  countSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  countText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4FF',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EyeButtonWithCount;

