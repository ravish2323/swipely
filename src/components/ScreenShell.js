import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
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

        <BodyComponent {...bodyProps}>{children}</BodyComponent>

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
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.5,
    marginTop: 4,
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
