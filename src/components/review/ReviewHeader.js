import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import spacing from '../../theme/spacing';

const ReviewHeader = ({
  title,
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
      <View style={styles.headerSpacer} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8B5CF6',
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 0 : spacing.sm,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textTransform: 'uppercase',
  },
});

export default ReviewHeader;
