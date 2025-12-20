import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PermissionsAndroid } from 'react-native';
import SMSService from '../../services/smsService';
import { colors, spacing, radii, typography } from '../../theme/tokens';

const PermissionsScreen = ({ onNext, onSkip }) => {
  const [requesting, setRequesting] = useState(false);

  const requestSMSPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Info', 'SMS permissions are only available on Android.');
      onSkip();
      return;
    }

    setRequesting(true);
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'SwipeLy needs access to read SMS to detect transaction messages.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await SMSService.initialize();
        Alert.alert('Success', 'SMS permission granted!');
        onNext();
      } else {
        Alert.alert(
          'Permission Denied',
          'You can still use the app with demo messages. You can enable SMS access later in settings.',
          [{ text: 'OK', onPress: onSkip }]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permission. Using demo mode.');
      onSkip();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.primary} />
        <Text style={styles.title}>Allow SMS access</Text>
        <Text style={styles.subtitle}>
          We read only bank/UPI alerts to detect transactions. Nothing is uploaded.
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={requestSMSPermission}
          disabled={requesting}
          testID="onboardingAllowSms"
          accessibilityLabel="Allow SMS permission"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            {requesting ? 'Requesting...' : 'Allow SMS Permission'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onSkip}
          testID="onboardingDemo"
          accessibilityLabel="Use demo messages"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Use Demo Messages
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    gap: spacing.md,
  },
  button: {
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
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: colors.bg,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
  },
});

export default PermissionsScreen;

