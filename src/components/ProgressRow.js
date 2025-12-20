import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography } from '../theme/tokens';

const ProgressRow = ({ total, remaining, onEyePressIn, onEyePressOut, maxDots = 5 }) => {
  const lastFilledDotIndex = useRef(-1);
  const dotAnimations = useRef([]).current;

  // Calculate progress
  const processed = total - remaining;
  const processedCount = Math.max(0, processed);
  const totalCount = Math.max(1, total);

  // Determine number of dots to show
  let numDots;
  let filledCount;

  if (totalCount <= maxDots) {
    numDots = totalCount;
    filledCount = processedCount;
  } else {
    numDots = maxDots;
    filledCount = Math.round((processedCount / totalCount) * maxDots);
  }

  // Initialize animations for dots
  if (dotAnimations.length !== numDots) {
    dotAnimations.length = 0;
    for (let i = 0; i < numDots; i++) {
      dotAnimations.push(new Animated.Value(1));
    }
  }

  // Pulse animation on last filled dot when remaining changes
  useEffect(() => {
    const currentFilledIndex = filledCount - 1;
    if (currentFilledIndex >= 0 && currentFilledIndex < numDots && currentFilledIndex !== lastFilledDotIndex.current) {
      lastFilledDotIndex.current = currentFilledIndex;
      
      // Pulse the last filled dot
      const pulse = Animated.sequence([
        Animated.timing(dotAnimations[currentFilledIndex], {
          toValue: 1.4,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnimations[currentFilledIndex], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
      pulse.start();
    }
  }, [remaining, filledCount]);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.dotsContainer}>
          {Array.from({ length: numDots }, (_, index) => {
            const isFilled = index < filledCount;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  isFilled ? styles.dotFilled : styles.dotEmpty,
                  {
                    transform: [{ scale: dotAnimations[index] || new Animated.Value(1) }],
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.countText}>
          {remaining} {remaining === 1 ? 'card' : 'cards'} remaining
        </Text>
      </View>
      {onEyePressIn && (
        <Pressable
          style={styles.eyeButton}
          onPressIn={onEyePressIn}
          onPressOut={onEyePressOut}
          hitSlop={12}
          accessibilityLabel="View last action"
          accessibilityRole="button"
        >
          <Ionicons name="eye" size={18} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    backgroundColor: colors.border,
  },
  countText: {
    ...typography.meta,
    color: colors.textSecondary,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressRow;
