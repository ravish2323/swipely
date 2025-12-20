import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../../theme/spacing';

const StarCelebration = ({
  title = "All Done!",
  subtitle = "You've processed all transactions for this period.",
  onAnimationComplete,
  autoStart = true,
}) => {
  const starScale = useRef(new Animated.Value(0)).current;
  const starRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (autoStart) {
      // Reset animations
      starScale.setValue(0);
      starRotation.setValue(0);
      textOpacity.setValue(0);
      textScale.setValue(0.8);

      // Small delay to ensure state is updated
      setTimeout(() => {
        // Continuous rotation animation
        Animated.timing(starRotation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();

        // Seamless scale animation: zoom -> settle -> pulse
        Animated.sequence([
          // Initial zoom
          Animated.timing(starScale, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          // Smooth settle to base
          Animated.timing(starScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // After star animation, show text with pop effect
          Animated.parallel([
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(textScale, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          });

          // Start continuous pulsing loop
          const animateStar = () => {
            Animated.sequence([
              Animated.timing(starScale, {
                toValue: 1.1,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(starScale, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]).start(() => {
              animateStar();
            });
          };
          animateStar();
        });
      }, 100);
    }
  }, [autoStart, starScale, starRotation, textOpacity, textScale, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [
              { scale: starScale },
              {
                rotate: starRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="star-outline" size={72} color="#B794F6" />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  starContainer: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: spacing.xl * 2,
    lineHeight: 24,
  },
});

export default StarCelebration;

