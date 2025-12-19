import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const SwipeCard = ({ transaction, onSwipe, index, showAmount = true }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
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
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();
        
        const swipeDirection = getSwipeDirection(gestureState);
        
        if (swipeDirection) {
          handleSwipe(swipeDirection);
        } else {
          // Return to center
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const getSwipeDirection = (gestureState) => {
    const { dx, dy } = gestureState;
    
    if (Math.abs(dy) > Math.abs(dx) && dy < -SWIPE_THRESHOLD) {
      return 'up'; // Swipe up (special)
    } else if (Math.abs(dy) > Math.abs(dx) && dy > SWIPE_THRESHOLD) {
      return 'down'; // Swipe down (categorize as food)
    } else if (dx > SWIPE_THRESHOLD) {
      return 'right'; // Swipe right
    } else if (dx < -SWIPE_THRESHOLD) {
      return 'left'; // Swipe left
    }
    return null;
  };

  const handleSwipe = (direction) => {
    let toValue;
    let status;
    let category = null;
    
    switch (direction) {
      case 'right':
        toValue = { x: SCREEN_WIDTH + 100, y: 0 };
        status = 'confirmed';
        break;
      case 'left':
        toValue = { x: -SCREEN_WIDTH - 100, y: 0 };
        status = 'rejected';
        break;
      case 'up':
        toValue = { x: 0, y: -SCREEN_HEIGHT - 100 };
        status = 'special';
        break;
      case 'down':
        toValue = { x: 0, y: SCREEN_HEIGHT + 100 };
        status = 'confirmed';
        category = 'food';
        break;
      default:
        return;
    }

    Animated.timing(position, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      if (onSwipe) {
        onSwipe(transaction.id, status, category);
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

  const getBackgroundColor = () => {
    const x = position.x._value;
    const y = position.y._value;
    
    if (Math.abs(y) > Math.abs(x) && y < -50) {
      return '#E3F2FD'; // Light blue for up
    } else if (Math.abs(y) > Math.abs(x) && y > 50) {
      return '#FFF3E0'; // Light orange for down (Food)
    } else if (x > 50) {
      return '#E8F5E9'; // Light green for right
    } else if (x < -50) {
      return '#FFEBEE'; // Light red for left
    }
    return '#FFFFFF';
  };

  const formatAmount = (amount) => {
    if (!amount) return '—';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '+';
    return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
  };

  const backgroundColor = position.x._value || position.y._value 
    ? getBackgroundColor() 
    : '#FFFFFF';

  return (
    <Animated.View
      style={[styles.card, getCardStyle(), { backgroundColor }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.cardContent}>
        {/* Header */}
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
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {Math.round(transaction.confidence * 100)}%
            </Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  confidenceBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 16,
  },
  bodyText: {
    fontSize: 16,
    color: '#3A3A3A',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  amountContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
});

export default SwipeCard;
