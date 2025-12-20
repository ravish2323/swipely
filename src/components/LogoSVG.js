/**
 * Logo component using react-native-svg
 * 
 * To use this component, first install react-native-svg:
 * npx expo install react-native-svg
 * 
 * Then import this component instead of Logo.js
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const LogoSVG = ({ size = 64, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          <LinearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#6200EE" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle cx="256" cy="256" r="240" fill="url(#purpleGradient)" />
        
        {/* Card/Expense element */}
        <Rect x="180" y="160" width="152" height="100" rx="12" fill="#FFFFFF" opacity="0.95" />
        <Rect x="190" y="175" width="132" height="8" rx="4" fill="#8B5CF6" opacity="0.3" />
        <Rect x="190" y="195" width="100" height="8" rx="4" fill="#8B5CF6" opacity="0.3" />
        <Rect x="190" y="215" width="80" height="8" rx="4" fill="#8B5CF6" opacity="0.3" />
        
        {/* Swipe arrow (curved) */}
        <Path
          d="M 320 220 Q 380 200, 420 240 Q 380 280, 320 260"
          stroke="#FFFFFF"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        
        {/* Arrow head */}
        <Path
          d="M 400 245 L 420 240 L 410 255 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
        
        {/* Swipe motion lines */}
        <Circle cx="340" cy="230" r="4" fill="#FFFFFF" opacity="0.6" />
        <Circle cx="360" cy="235" r="4" fill="#FFFFFF" opacity="0.6" />
        <Circle cx="380" cy="240" r="4" fill="#FFFFFF" opacity="0.6" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LogoSVG;

