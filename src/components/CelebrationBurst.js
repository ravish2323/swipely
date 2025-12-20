import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';
import { colors, shadows } from '../theme/tokens';
import { durations } from '../theme/anim';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CelebrationBurst = ({ visible, onDone, size = 220 }) => {
  // Card animations (3 cards)
  const card1Scale = useRef(new Animated.Value(0.8)).current;
  const card1Opacity = useRef(new Animated.Value(0)).current;
  const card1Rotation = useRef(new Animated.Value(-12)).current;
  const card1FlyX = useRef(new Animated.Value(0)).current;
  const card1FlyY = useRef(new Animated.Value(0)).current;

  const card2Scale = useRef(new Animated.Value(0.8)).current;
  const card2Opacity = useRef(new Animated.Value(0)).current;
  const card2Rotation = useRef(new Animated.Value(0)).current;
  const card2FlyX = useRef(new Animated.Value(0)).current;
  const card2FlyY = useRef(new Animated.Value(0)).current;

  const card3Scale = useRef(new Animated.Value(0.8)).current;
  const card3Opacity = useRef(new Animated.Value(0)).current;
  const card3Rotation = useRef(new Animated.Value(12)).current;
  const card3FlyX = useRef(new Animated.Value(0)).current;
  const card3FlyY = useRef(new Animated.Value(0)).current;

  // Halo ring
  const haloScale = useRef(new Animated.Value(0.9)).current;
  const haloOpacity = useRef(new Animated.Value(0.25)).current;

  // Confetti dots (8 dots)
  const dotAnims = useRef(
    Array.from({ length: 8 }, () => ({
      progress: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // Dot positions (N, NE, E, SE, S, SW, W, NW)
  const dotAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const dotDistance = 32;
  const dotColors = [
    colors.primary,
    colors.specialBg,
    colors.successBg,
    colors.primary,
    colors.specialBg,
    colors.successBg,
    colors.primary,
    colors.specialBg,
  ];

  useEffect(() => {
    if (!visible) {
      // Reset all animations
      card1Scale.setValue(0.8);
      card1Opacity.setValue(0);
      card1Rotation.setValue(-12);
      card1FlyX.setValue(0);
      card1FlyY.setValue(0);

      card2Scale.setValue(0.8);
      card2Opacity.setValue(0);
      card2Rotation.setValue(0);
      card2FlyX.setValue(0);
      card2FlyY.setValue(0);

      card3Scale.setValue(0.8);
      card3Opacity.setValue(0);
      card3Rotation.setValue(12);
      card3FlyX.setValue(0);
      card3FlyY.setValue(0);

      haloScale.setValue(0.9);
      haloOpacity.setValue(0.25);

      dotAnims.forEach((dot) => {
        dot.progress.setValue(0);
        dot.translateX.setValue(0);
        dot.translateY.setValue(0);
        dot.opacity.setValue(1);
        dot.scale.setValue(1);
      });
      return;
    }

    // A) Card stack pop-in (150ms)
    const cardPopIn = Animated.parallel([
      Animated.timing(card1Scale, {
        toValue: 1.0,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card1Opacity, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card2Scale, {
        toValue: 1.0,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card2Opacity, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card3Scale, {
        toValue: 1.0,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card3Opacity, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // B) Halo ring expansion (450ms, starts with card pop-in)
    const haloAnimation = Animated.parallel([
      Animated.timing(haloScale, {
        toValue: 1.6,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(haloOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // C) Confetti dots burst (staggered over 450ms)
    const dotAnimations = dotAnims.map((dot, index) => {
      const angle = (dotAngles[index] * Math.PI) / 180;
      const translateX = Math.cos(angle) * dotDistance;
      const translateY = Math.sin(angle) * dotDistance;

      return Animated.sequence([
        Animated.delay(index * 40), // Stagger by 40ms
        Animated.parallel([
          Animated.timing(dot.progress, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot.translateX, {
            toValue: translateX,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot.translateY, {
            toValue: translateY,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot.opacity, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot.scale, {
            toValue: 0.6,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    // D) Cards swipe out (220ms, starts after pop-in)
    const cardSwipeOut = Animated.parallel([
      // Card 1: swipe left
      Animated.timing(card1FlyX, {
        toValue: -SCREEN_WIDTH * 0.4,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card1Opacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Card 2: swipe right
      Animated.timing(card2FlyX, {
        toValue: SCREEN_WIDTH * 0.4,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card2Opacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Card 3: swipe up
      Animated.timing(card3FlyY, {
        toValue: -SCREEN_HEIGHT * 0.3,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card3Opacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Main sequence
    Animated.sequence([
      // Start card pop-in and halo together
      Animated.parallel([cardPopIn, haloAnimation]),
      // Then swipe out cards
      cardSwipeOut,
    ]).start(() => {
      if (onDone) {
        onDone();
      }
    });

    // Start confetti dots in parallel (they run independently)
    Animated.parallel(dotAnimations).start();
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Halo Ring */}
      <Animated.View
        style={[
          styles.halo,
          {
            transform: [{ scale: haloScale }],
            opacity: haloOpacity,
            borderColor: colors.primary,
          },
        ]}
      />

      {/* Confetti Dots */}
      {dotAnims.map((dot, index) => {
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: dotColors[index],
                transform: [
                  { translateX: dot.translateX },
                  { translateY: dot.translateY },
                  { scale: dot.scale },
                ],
                opacity: dot.opacity,
              },
            ]}
          />
        );
      })}

      {/* Card Stack */}
      <View style={styles.cardStack}>
        {/* Card 1 (left) */}
        <Animated.View
          style={[
            styles.card,
            styles.card1,
            {
              transform: [
                { scale: card1Scale },
                {
                  rotate: card1Rotation.interpolate({
                    inputRange: [-12, 0],
                    outputRange: ['-12deg', '-12deg'],
                  }),
                },
                { translateX: card1FlyX },
                { translateY: card1FlyY },
              ],
              opacity: card1Opacity,
            },
          ]}
        />

        {/* Card 2 (center) */}
        <Animated.View
          style={[
            styles.card,
            styles.card2,
            {
              transform: [
                { scale: card2Scale },
                {
                  rotate: card2Rotation.interpolate({
                    inputRange: [0, 12],
                    outputRange: ['0deg', '0deg'],
                  }),
                },
                { translateX: card2FlyX },
                { translateY: card2FlyY },
              ],
              opacity: card2Opacity,
            },
          ]}
        />

        {/* Card 3 (right) */}
        <Animated.View
          style={[
            styles.card,
            styles.card3,
            {
              transform: [
                { scale: card3Scale },
                {
                  rotate: card3Rotation.interpolate({
                    inputRange: [0, 12],
                    outputRange: ['12deg', '12deg'],
                  }),
                },
                { translateX: card3FlyX },
                { translateY: card3FlyY },
              ],
              opacity: card3Opacity,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  halo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    backgroundColor: 'transparent',
    top: '50%',
    left: '50%',
    marginTop: -90, // Half of height
    marginLeft: -90, // Half of width
  },
  cardStack: {
    position: 'absolute',
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    marginTop: -40, // Half of height
    marginLeft: -30, // Half of width
  },
  card: {
    position: 'absolute',
    width: 50,
    height: 70,
    borderRadius: 12,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  card1: {
    left: -8,
    top: -5,
  },
  card2: {
    left: 0,
    top: 0,
  },
  card3: {
    left: 8,
    top: -5,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4, // Center the dot (half of width)
    marginTop: -4, // Center the dot (half of height)
  },
});

export default CelebrationBurst;

