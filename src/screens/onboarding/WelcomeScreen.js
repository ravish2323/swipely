import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const WelcomeScreen = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SwipeLy</Text>
        <Text style={styles.subtitle}>Swipe your expenses into control</Text>

        <View style={styles.bullets}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Auto-detects transaction SMS</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Review in seconds with swipes</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Local-only storage (private)</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onNext}
        testID="onboardingGetStarted"
        accessibilityLabel="Get started"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 42,
    color: colors.primary,
    marginBottom: spacing.md,
    fontFamily: Platform.select({ ios: 'System', android: 'SpaceGrotesk_600SemiBold' }) || 'sans-serif',
  },
  subtitle: {
    ...typography.body,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl * 2,
  },
  bullets: {
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  bullet: {
    ...typography.body,
    fontSize: 20,
    color: colors.primary,
    marginRight: spacing.md,
  },
  bulletText: {
    ...typography.body,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.button,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    ...typography.body,
    fontSize: 16,
    color: colors.bg,
    fontWeight: '600',
  },
});

export default WelcomeScreen;

