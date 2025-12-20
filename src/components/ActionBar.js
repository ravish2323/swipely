import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../theme/tokens';
import { durations, easing } from '../theme/anim';

// Optional haptics import
let Haptics = null;
try {
  Haptics = require('expo-haptics').default || require('expo-haptics');
} catch (e) {
  // Haptics not available
}

const ActionBar = ({ onReject, onFood, onSpecial, onConfirm }) => {
  const scaleAnims = useRef({
    reject: new Animated.Value(1),
    food: new Animated.Value(1),
    special: new Animated.Value(1),
    confirm: new Animated.Value(1),
  }).current;

  const triggerHaptic = (type) => {
    if (!Haptics) return;
    try {
      switch (type) {
        case 'confirm':
          if (Haptics.NotificationFeedbackType) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          break;
        case 'reject':
          if (Haptics.NotificationFeedbackType) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          break;
        case 'special':
        case 'food':
          if (Haptics.ImpactFeedbackStyle) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          break;
      }
    } catch (e) {
      // Haptics failed
    }
  };

  const handlePress = (action, callback) => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnims[action], {
        toValue: 0.9,
        duration: durations.fast,
        easing: easing.out,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[action], {
        toValue: 1,
        speed: 18,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();

    triggerHaptic(action);
    callback();
  };

  const buttonSize = 56;
  const hitSlop = { top: 12, bottom: 12, left: 12, right: 12 };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnims.reject }] }}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handlePress('reject', onReject)}
          testID="rejectBtn"
          accessibilityLabel="Reject transaction"
          accessibilityRole="button"
          hitSlop={hitSlop}
        >
          <Ionicons name="close-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: scaleAnims.food }] }}>
        <TouchableOpacity
          style={[styles.button, styles.foodButton]}
          onPress={() => handlePress('food', onFood)}
          testID="foodBtn"
          accessibilityLabel="Mark as food"
          accessibilityRole="button"
          hitSlop={hitSlop}
        >
          <Ionicons name="restaurant-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: scaleAnims.special }] }}>
        <TouchableOpacity
          style={[styles.button, styles.specialButton]}
          onPress={() => handlePress('special', onSpecial)}
          testID="specialBtn"
          accessibilityLabel="Mark as special"
          accessibilityRole="button"
          hitSlop={hitSlop}
        >
          <Ionicons name="star-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: scaleAnims.confirm }] }}>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={() => handlePress('confirm', onConfirm)}
          testID="confirmBtn"
          accessibilityLabel="Confirm transaction"
          accessibilityRole="button"
          hitSlop={hitSlop}
        >
          <Ionicons name="checkmark-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: radii.button,
    justifyContent: 'center',
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
  rejectButton: {
    backgroundColor: colors.rejectBg,
  },
  foodButton: {
    backgroundColor: colors.foodBg,
  },
  specialButton: {
    backgroundColor: colors.specialBg,
  },
  confirmButton: {
    backgroundColor: colors.successBg,
  },
});

export default ActionBar;

