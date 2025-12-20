import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme/tokens';
import { Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoadingScreen = ({ error }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0.25)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo pulse animation (slow and smooth)
    const logoPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1.0,
          duration: 1500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    // Floating motion (subtle vertical float)
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    // Halo ripple animation
    const haloRipple = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1.35,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1.0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.25,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Loading dots wave animation
    const dotWave = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Start all animations
    logoPulse.start();
    floatAnimation.start();
    haloRipple.start();
    dotWave.start();

    return () => {
      logoPulse.stop();
      floatAnimation.stop();
      haloRipple.stop();
      dotWave.stop();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      
      {/* Background decorative elements */}
      <View style={styles.backgroundElements}>
        {/* Soft circles */}
        <View style={[styles.softCircle, styles.circle1]} />
        <View style={[styles.softCircle, styles.circle2]} />
        <View style={[styles.softCircle, styles.circle3]} />
        
        {/* Card stack motif */}
        <View style={[styles.cardStack, styles.cardStack1]} />
        <View style={[styles.cardStack, styles.cardStack2]} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Top spacer */}
        <View style={styles.topSpacer} />

        {/* Center brand block */}
        <View style={styles.brandBlock}>
          {/* Logo with halo */}
          <View style={styles.logoContainer}>
            {/* Halo ripple ring */}
            <Animated.View
              style={[
                styles.halo,
                {
                  transform: [{ scale: haloScale }],
                  opacity: haloOpacity,
                },
              ]}
            />
            
            {/* Logo image */}
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  transform: [
                    { scale: logoScale },
                    { translateY: floatY },
                  ],
                  opacity: logoOpacity,
                },
              ]}
            >
              <Image
                source={require('../../assets/ChatGPT Image Dec 20, 2025, 10_45_05 PM.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* App name */}
          <Text style={styles.appName}>SwipeLy</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Swipe your expenses{'\n'}into control
          </Text>
        </View>

        {/* Bottom area */}
        <View style={styles.bottomArea}>
          {/* Loading indicator */}
          <View style={styles.loadingIndicator}>
            <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
          </View>

          {/* Privacy note */}
          <Text style={styles.privacyNote}>Local-only. Nothing uploaded.</Text>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubtext}>
                The app will still work, but some features may be limited.
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  backgroundElements: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  softCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  circle1: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    opacity: 0.05,
    top: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.15,
  },
  circle2: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    opacity: 0.06,
    bottom: SCREEN_HEIGHT * 0.1,
    left: -SCREEN_WIDTH * 0.2,
  },
  circle3: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    opacity: 0.04,
    top: SCREEN_HEIGHT * 0.3,
    right: SCREEN_WIDTH * 0.1,
  },
  cardStack: {
    position: 'absolute',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  cardStack1: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.35,
    opacity: 0.08,
    transform: [{ rotate: '-8deg' }],
    top: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.1,
  },
  cardStack2: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.35,
    opacity: 0.06,
    transform: [{ rotate: '12deg' }],
    top: SCREEN_HEIGHT * 0.2,
    right: SCREEN_WIDTH * 0.15,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  topSpacer: {
    flex: 0.3,
  },
  brandBlock: {
    alignItems: 'center',
    flex: 0.4,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  halo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: Platform.OS === 'ios' ? 26 : 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'SpaceGrotesk_600SemiBold',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_500Medium',
  },
  bottomArea: {
    flex: 0.3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  privacyNote: {
    fontSize: 11,
    color: colors.textSecondary,
    opacity: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_400Regular',
  },
  errorContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    maxWidth: '90%',
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_500Medium',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_400Regular',
  },
});

export default LoadingScreen;

