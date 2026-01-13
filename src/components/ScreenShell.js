import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
  Animated,
} from 'react-native';

const ScreenShell = ({
  title,
  subtitle,
  topSlot,
  bottomSlot,
  children,
  useScrollView = false,
  contentContainerStyle,
  bodyStyle,
  scrollProps = {},
  bodyAnimatedStyle,
  bodyPanHandlers,
}) => {
  const BodyComponent = useScrollView ? ScrollView : View;
  const bodyProps = useScrollView
    ? {
        style: [styles.body, bodyStyle],
        contentContainerStyle: [styles.bodyContent, contentContainerStyle],
        ...scrollProps,
      }
    : {
        style: [styles.body, styles.bodyContent, bodyStyle, contentContainerStyle],
      };

  // Wrap body in Animated.View if animation props are provided
  const BodyWrapper = bodyAnimatedStyle || bodyPanHandlers ? Animated.View : View;
  const bodyWrapperProps = bodyAnimatedStyle || bodyPanHandlers
    ? {
        style: [styles.bodyWrapper, bodyAnimatedStyle],
        ...bodyPanHandlers,
      }
    : { style: styles.bodyWrapper };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {topSlot}

        <BodyWrapper {...bodyWrapperProps}>
          <BodyComponent {...bodyProps}>{children}</BodyComponent>
        </BodyWrapper>

        {bottomSlot}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : Platform.select({ android: 'Inter_600SemiBold' }) || 'sans-serif',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  bodyWrapper: {
    flex: 1,
  },
  body: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  bodyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});

export default ScreenShell;
