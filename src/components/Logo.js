import React from 'react';
import { View, StyleSheet } from 'react-native';
// For gradient support, install: npx expo install expo-linear-gradient
// Then uncomment: import { LinearGradient } from 'expo-linear-gradient';

/**
 * Logo component for SpendSwipe
 * 
 * Usage:
 * <Logo size={64} />
 * 
 * Note: For full SVG support with better quality, install react-native-svg:
 * npx expo install react-native-svg
 * 
 * Then use LogoSVG.js component instead.
 */
const Logo = ({ size = 64, style }) => {
  const cardWidth = size * 0.3;
  const cardHeight = size * 0.2;
  const cardLeft = size * 0.15;
  const cardTop = size * 0.25;
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View
        style={[styles.logoContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#6200EE' }]}
      >
        {/* Card/Expense element */}
        <View style={[styles.card, {
          width: cardWidth,
          height: cardHeight,
          left: cardLeft,
          top: cardTop,
          borderRadius: size * 0.023,
        }]}>
          <View style={[styles.cardLine, { width: cardWidth * 0.87, top: cardHeight * 0.15 }]} />
          <View style={[styles.cardLine, { width: cardWidth * 0.66, top: cardHeight * 0.35 }]} />
          <View style={[styles.cardLine, { width: cardWidth * 0.53, top: cardHeight * 0.55 }]} />
        </View>
        
        {/* Swipe arrow (simplified curved representation) */}
        <View style={[styles.arrowContainer, {
          left: size * 0.625,
          top: size * 0.43,
        }]}>
          <View style={[styles.arrowLine, {
            width: size * 0.2,
            height: size * 0.02,
            transform: [{ rotate: '-20deg' }],
          }]} />
          <View style={[styles.arrowHead, {
            width: size * 0.04,
            height: size * 0.04,
            left: size * 0.18,
            top: -size * 0.01,
            transform: [{ rotate: '45deg' }],
          }]} />
        </View>
        
        {/* Swipe motion dots */}
        <View style={[styles.dot, { left: size * 0.66, top: size * 0.45, width: size * 0.008, height: size * 0.008 }]} />
        <View style={[styles.dot, { left: size * 0.70, top: size * 0.46, width: size * 0.008, height: size * 0.008 }]} />
        <View style={[styles.dot, { left: size * 0.74, top: size * 0.47, width: size * 0.008, height: size * 0.008 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    opacity: 0.95,
  },
  cardLine: {
    position: 'absolute',
    height: '8%',
    backgroundColor: '#8B5CF6',
    opacity: 0.3,
    borderRadius: 2,
    left: '5%',
  },
  arrowContainer: {
    position: 'absolute',
  },
  arrowLine: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    opacity: 0.9,
  },
  arrowHead: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  dot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    opacity: 0.6,
  },
});

export default Logo;

