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

      Animated.timing(translateX, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
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
          const touchX = evt.nativeEvent.locationX;
          const nearScreenEdge =
            edgeActivationWidth === 0 ||
            touchX <= edgeActivationWidth ||
            touchX >= SCREEN_WIDTH - edgeActivationWidth;
          return Math.abs(gestureState.dx) > 10 && nearScreenEdge;
        },
        onPanResponderGrant: () => {
          translateX.stopAnimation();
        },
        onPanResponderMove: (evt, gestureState) => {
          translateX.setValue(gestureState.dx);
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx > threshold) {
            animateToDirection('right');
          } else if (gestureState.dx < -threshold) {
            animateToDirection('left');
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

  const animatedStyle = useMemo(
    () => ({
      transform: [{ translateX }],
      opacity: translateX.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
      }),
      backgroundColor: backdropColor,
    }),
    [backdropColor, translateX]
  );

  return {
    animatedStyle,
    panHandlers: panResponder.panHandlers,
    navigateLeft: () => animateToDirection('left'),
    navigateRight: () => animateToDirection('right'),
    resetTranslation,
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
