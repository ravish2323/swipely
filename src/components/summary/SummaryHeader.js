import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import spacing from '../../theme/spacing';

const SummaryHeader = ({
  title,
  subtitle,
  paddingTop = Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
  paddingBottom = spacing.lg,
  paddingHorizontal = spacing.xl,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop,
          paddingBottom,
          paddingHorizontal,
        },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8B5CF6',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
});

export default SummaryHeader;
