import React from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../../theme/spacing';

const CardStage = ({
  filteredTransactions,
  transactionsLength,
  renderCard,
  emptyStatePanHandlers,
  emptyStateSwipeStyle,
  starAnimatedStyle,
  emptyTextAnimatedStyle,
  completionAnimatedStyle,
  eyeButtonPanHandlers,
  eyeButtonStyle,
  onEyePressIn,
  onEyePressOut,
  showCompletion = true,
  paddingHorizontal = spacing.xl,
  paddingVertical = spacing.xl,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal,
          paddingVertical,
        },
      ]}
    >
      {filteredTransactions.length === 0 ? (
        <Animated.View
          style={[styles.emptyContainer, emptyStateSwipeStyle]}
          {...emptyStatePanHandlers}
        >
          <Animated.View style={[styles.starContainer, starAnimatedStyle]}>
            <Ionicons name="star-outline" size={72} color="#B794F6" />
          </Animated.View>
          <Animated.View
            style={[styles.emptyTextContainer, emptyTextAnimatedStyle]}
          >
            <Text style={styles.emptyTitle}>All Done!</Text>
            <Text style={styles.emptyText}>
              You've processed all transactions for this period.
            </Text>
          </Animated.View>
        </Animated.View>
      ) : (
        renderCard()
      )}

      {transactionsLength > 0 && (
        <View style={styles.eyeButtonContainer}>
          <Animated.View
            style={[styles.draggableEyeButton, eyeButtonStyle]}
            {...eyeButtonPanHandlers}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.eyeButtonInner}
              onPressIn={onEyePressIn}
              onPressOut={onEyePressOut}
            >
              <Ionicons name="eye" size={26} color="#8B5CF6" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {filteredTransactions.length === 0 && transactionsLength === 0 && showCompletion && (
        <Animated.View style={[styles.completionAnimation, completionAnimatedStyle]}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={styles.completionText}>All Done!</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  starContainer: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: spacing.xl * 2,
    lineHeight: 24,
  },
  eyeButtonContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.xl,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  draggableEyeButton: {
    width: 52,
    height: 52,
  },
  eyeButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completionAnimation: {
    position: 'absolute',
    bottom: spacing.xxl,
    alignItems: 'center',
  },
  completionText: {
    marginTop: spacing.sm,
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
});

export default CardStage;
