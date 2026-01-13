import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, PanResponder, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const SWIPE_DURATION = 300;

export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  backdropColor = '#F8F9FA',
  threshold = SWIPE_THRESHOLD,
  duration = SWIPE_DURATION,
  edgeActivationWidth = 0,
} = {}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const resetTranslation = useCallback(() => {
    translateX.stopAnimation();
    translateX.setValue(0);
  }, [translateX]);

  const animateToDirection = useCallback(
    (direction) => {
      const navigate = direction === 'left' ? onSwipeLeft : onSwipeRight;

      if (!navigate) {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
        return;
      }

      const toValue = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;

      // Smoother iOS-like easing
      Animated.timing(translateX, {
        toValue,
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start(() => {
        navigate();
        resetTranslation();
      });
    },
    [duration, onSwipeLeft, onSwipeRight, resetTranslation, translateX]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Only activate from screen edges to avoid conflicts with card swipes
          const touchX = evt.nativeEvent.locationX;
          const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          
          // Only activate if near screen edge
          const nearScreenEdge =
            edgeActivationWidth === 0 ||
            touchX <= edgeActivationWidth ||
            touchX >= SCREEN_WIDTH - edgeActivationWidth;
          
          // Require significant horizontal movement and be near edge
          if (!nearScreenEdge || !isHorizontalSwipe) {
            return false;
          }
          
          // Require minimum distance to avoid accidental activation
          return Math.abs(gestureState.dx) > 15;
        },
        onPanResponderGrant: () => {
          translateX.stopAnimation();
        },
        onPanResponderMove: (evt, gestureState) => {
          // Clamp the translation to prevent over-swiping
          const clampedDx = Math.max(-SCREEN_WIDTH, Math.min(SCREEN_WIDTH, gestureState.dx));
          translateX.setValue(clampedDx);
        },
        onPanResponderRelease: (evt, gestureState) => {
          const velocity = gestureState.vx;
          const shouldNavigate = Math.abs(gestureState.dx) > threshold || Math.abs(velocity) > 0.5;
          
          if (shouldNavigate) {
            if (gestureState.dx > 0 || velocity > 0.3) {
              animateToDirection('right');
            } else if (gestureState.dx < 0 || velocity < -0.3) {
              animateToDirection('left');
            } else {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }).start();
            }
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }
        },
      }),
    [animateToDirection, edgeActivationWidth, threshold, translateX]
  );

  // Improved animation with scale and shadow for peek effect
  const animatedStyle = useMemo(
    () => ({
      transform: [
        { translateX },
        {
          scale: translateX.interpolate({
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            outputRange: [0.95, 1, 0.95],
            extrapolate: 'clamp',
          }),
        },
      ],
      opacity: translateX.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: [0.7, 1, 0.7],
        extrapolate: 'clamp',
      }),
      backgroundColor: backdropColor,
      shadowColor: '#000',
      shadowOpacity: translateX.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: [0.3, 0, 0.3],
        extrapolate: 'clamp',
      }),
      shadowRadius: 10,
      shadowOffset: { width: -5, height: 0 },
      elevation: translateX.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: [8, 0, 8],
        extrapolate: 'clamp',
      }),
    }),
    [backdropColor, translateX]
  );

  return {
    animatedStyle,
    panHandlers: panResponder.panHandlers,
    navigateLeft: () => animateToDirection('left'),
    navigateRight: () => animateToDirection('right'),
    resetTranslation,
    translateX, // Expose translateX for peek preview
  };
};

const AnimatedNavigationWrapper = ({
  children,
  style,
  onSwipeLeft,
  onSwipeRight,
  backdropColor,
  threshold,
  duration,
  edgeActivationWidth,
}) => {
  const { animatedStyle, panHandlers } = useSwipeNavigation({
    onSwipeLeft,
    onSwipeRight,
    backdropColor,
    threshold,
    duration,
    edgeActivationWidth,
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle, style]} {...panHandlers}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});

export default AnimatedNavigationWrapper;
