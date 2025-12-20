import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { swipeThresholds, durations, easing, springConfig } from '../theme/anim';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TransactionCard = ({ transaction, onSwipe, overlayColor }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [swipeOverlayColor, setSwipeOverlayColor] = useState(null);

  // Reset position when transaction changes (new card appears)
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
    overlayOpacity.setValue(0);
    setSwipeOverlayColor(null);
  }, [transaction.id]);

  const rotate = position.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        overlayOpacity.setValue(0);
        setSwipeOverlayColor(null); // Reset color on new gesture
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });

        // Determine swipe direction and set overlay color
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        // Only set color if there's significant movement
        if (absDx > 10 || absDy > 10) {
          if (absDx > absDy) {
            // Horizontal swipe
            if (dx > 0) {
              setSwipeOverlayColor(colors.successBg); // Right = Confirm (Green)
            } else {
              setSwipeOverlayColor(colors.rejectBg); // Left = Reject (Red)
            }
          } else {
            // Vertical swipe
            if (dy < 0) {
              setSwipeOverlayColor(colors.specialBg); // Up = Special (Blue)
            } else {
              setSwipeOverlayColor(colors.foodBg); // Down = Food (Yellow)
            }
          }
        }

        // Update overlay opacity based on drag distance
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const opacity = Math.min(1, distance / 100); // Full opacity for direct color change
        overlayOpacity.setValue(opacity);
      },
      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();

        const { dx, dy, vx, vy } = gestureState;
        const distanceX = Math.abs(dx);
        const distanceY = Math.abs(dy);
        const velocity = Math.sqrt(vx ** 2 + vy ** 2);

        let direction = null;

        // Check thresholds
        if (distanceX > swipeThresholds.distanceThresholdX && Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else if (distanceY > swipeThresholds.distanceThresholdY && Math.abs(dy) > Math.abs(dx)) {
          direction = dy < 0 ? 'up' : 'down';
        } else if (velocity > swipeThresholds.velocityThreshold) {
          // Velocity-based detection
          if (Math.abs(vx) > Math.abs(vy)) {
            direction = vx > 0 ? 'right' : 'left';
          } else {
            direction = vy < 0 ? 'up' : 'down';
          }
        }

        if (direction) {
          handleSwipe(direction, velocity);
        } else {
          // Return to center
          setSwipeOverlayColor(null);
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              ...springConfig,
              useNativeDriver: false,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: durations.fast,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleSwipe = (direction, velocity) => {
    let toValue;
    let status;
    let category = null;
    let actionType = null;

    switch (direction) {
      case 'right':
        toValue = { x: SCREEN_WIDTH * 1.2, y: 0 };
        status = 'confirmed';
        actionType = 'confirm';
        break;
      case 'left':
        toValue = { x: -SCREEN_WIDTH * 1.2, y: 0 };
        status = 'rejected';
        actionType = 'reject';
        break;
      case 'up':
        toValue = { x: 0, y: -SCREEN_HEIGHT * 0.9 };
        status = 'special';
        actionType = 'favorite';
        break;
      case 'down':
        toValue = { x: 0, y: SCREEN_HEIGHT * 0.9 };
        status = 'confirmed';
        category = 'food';
        actionType = 'food';
        break;
      default:
        return;
    }

    Animated.timing(position, {
      toValue,
      duration: durations.normal,
      easing: easing.out,
      useNativeDriver: false,
    }).start(() => {
      if (onSwipe) {
        onSwipe(transaction.id, status, category, actionType);
      }
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '—';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '+';
    return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  // Use swipe overlay color if available, otherwise use prop overlayColor
  const activeOverlayColor = swipeOverlayColor || overlayColor;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.card, 
          cardStyle,
          {
            backgroundColor: activeOverlayColor || colors.bg,
          }
        ]} 
        {...panResponder.panHandlers}
      >
        <View style={styles.cardContent}>
          {/* Top row: sender + amount */}
          <View style={styles.topRow}>
            <View style={styles.senderContainer}>
              <Text style={styles.sender} numberOfLines={1}>
                {transaction.sender}
              </Text>
            </View>
            <Text style={styles.amount}>{formatAmount(transaction.amount)}</Text>
          </View>

          {/* Meta row: date/time */}
          <Text style={styles.meta}>{formatDate(transaction.timestamp)}</Text>

          {/* SMS preview */}
          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText} numberOfLines={3}>
              {transaction.body}
            </Text>
          </View>

          {/* Confidence badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {Math.round((transaction.confidence || 0) * 100)}%
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: SCREEN_HEIGHT * 0.45,
    maxHeight: 450,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.card,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: radii.card,
    backgroundColor: colors.bg,
    ...shadows.card,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  senderContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  sender: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  amount: {
    ...typography.title,
    fontSize: 28,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.meta,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  badgeContainer: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  confidenceBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  confidenceText: {
    ...typography.meta,
    color: colors.bg,
    fontSize: 11,
  },
});

export default TransactionCard;

