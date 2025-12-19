import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const SwipeCard = ({ 
  transaction, 
  onSwipe, 
  index, 
  showAmount = true,
  showActionButtons = false,
  onToggleActionButtons = null,
}) => {
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });
  
  // Animated background color
  const bgColor = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        bgColor.setValue(0); // Reset color on new gesture
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
        
        // Update background color based on swipe direction
        const { dx, dy } = gestureState;
        if (Math.abs(dy) > Math.abs(dx)) {
          if (dy < -50) {
            bgColor.setValue(1); // Blue (up)
          } else if (dy > 50) {
            bgColor.setValue(2); // Yellow (down)
          } else {
            bgColor.setValue(0); // White
          }
        } else {
          if (dx > 50) {
            bgColor.setValue(3); // Green (right)
          } else if (dx < -50) {
            bgColor.setValue(4); // Red (left)
          } else {
            bgColor.setValue(0); // White
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();
        
        const swipeDirection = getSwipeDirection(gestureState);
        const velocity = Math.sqrt(gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy);
        
        if (swipeDirection) {
          handleSwipe(swipeDirection, velocity);
        } else {
          // Return to center with velocity-based animation
          const returnDuration = Math.min(300, Math.max(150, 300 - velocity * 10));
          Animated.parallel([
            Animated.timing(position, {
              toValue: { x: 0, y: 0 },
              duration: returnDuration,
              useNativeDriver: false,
            }),
            Animated.timing(bgColor, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const getSwipeDirection = (gestureState) => {
    const { dx, dy } = gestureState;
    
    // Check vertical swipes first (up/down)
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < -SWIPE_THRESHOLD) {
        return 'up'; // Swipe up (favorite/special)
      } else if (dy > SWIPE_THRESHOLD) {
        return 'down'; // Swipe down (food)
      }
    } else {
      // Horizontal swipes
      if (dx > SWIPE_THRESHOLD) {
        return 'right'; // Swipe right (confirm)
      } else if (dx < -SWIPE_THRESHOLD) {
        return 'left'; // Swipe left (reject)
      }
    }
    return null;
  };

  const handleSwipe = (direction, velocity = 0) => {
    let toValue;
    let status;
    let category = null;
    let actionType = null;
    
    switch (direction) {
      case 'right':
        toValue = { x: SCREEN_WIDTH + 100, y: 0 };
        status = 'confirmed';
        actionType = 'confirm';
        break;
      case 'left':
        toValue = { x: -SCREEN_WIDTH - 100, y: 0 };
        status = 'rejected';
        actionType = 'reject';
        break;
      case 'up':
        toValue = { x: 0, y: -SCREEN_HEIGHT - 100 };
        status = 'special';
        actionType = 'favorite';
        break;
      case 'down':
        toValue = { x: 0, y: SCREEN_HEIGHT + 100 };
        status = 'confirmed';
        category = 'food';
        actionType = 'food';
        break;
      default:
        return;
    }

    // Use velocity to determine animation speed - faster swipe = faster animation
    const baseDuration = 200;
    const velocityFactor = Math.min(1, Math.max(0.4, 1 - Math.abs(velocity) * 0.15));
    const duration = Math.max(120, Math.min(300, baseDuration * velocityFactor));

    Animated.timing(position, {
      toValue,
      duration,
      useNativeDriver: false,
    }).start(() => {
      if (onSwipe) {
        onSwipe(transaction.id, status, category, actionType);
      }
    });
  };

  const getCardStyle = () => {
    const rotateCard = rotate;
    const translateX = position.x;
    const translateY = position.y;
    
    const opacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: rotateCard },
      ],
      opacity,
    };
  };

  const formatAmount = (amount) => {
    if (!amount) return '—';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '+';
    return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
  };

  // Animated background color interpolation
  const backgroundColor = bgColor.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      '#FFFFFF', // White (default)
      '#edf0ff', // Soft blue (up/favorite)
      '#fff5d9', // Soft yellow (down/food)
      '#e8f7f0', // Soft green (right/confirm)
      '#ffe6e6', // Soft red (left/reject)
    ],
  });

  return (
    <Animated.View
      style={[styles.card, getCardStyle(), { backgroundColor }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.cardContent}>
        {/* Header with Star Toggle */}
        <View style={styles.header}>
          <View style={styles.senderContainer}>
            <Text style={styles.sender} numberOfLines={1}>
              {transaction.sender}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(transaction.timestamp * 1000).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {Math.round(transaction.confidence * 100)}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Body */}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText} numberOfLines={6}>
            {transaction.body}
          </Text>
        </View>
        
        {/* Amount */}
        {showAmount && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountValue}>
              {formatAmount(transaction.amount)}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.55,
    maxHeight: 600,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'absolute',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  senderContainer: {
    flex: 1,
    marginRight: 12,
  },
  sender: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_600SemiBold' }) || 'sans-serif',
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_400Regular' }) || 'sans-serif',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', android: 'SpaceGrotesk_600SemiBold' }) || 'sans-serif',
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 16,
  },
  bodyText: {
    fontSize: 16,
    color: '#3A3A3A',
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: Platform.select({ ios: 'System', android: 'Inter_400Regular' }) || 'sans-serif',
  },
  amountContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: Platform.select({ ios: 'System', android: 'SpaceGrotesk_600SemiBold' }) || 'sans-serif',
  },
});

export default SwipeCard;
