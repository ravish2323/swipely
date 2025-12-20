import { StyleSheet, Platform } from 'react-native';
import { colors, radii, spacing, shadows, typography } from './tokens';

export const cardStyle = {
  backgroundColor: colors.bg,
  borderRadius: radii.card,
  padding: spacing.xl,
  ...shadows.card,
};

export const pillStyle = {
  borderRadius: radii.pill,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
};

export const buttonStyle = {
  borderRadius: radii.button,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  ...shadows.button,
};

export const textStyles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  h2: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  bodySecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.meta,
    color: colors.textSecondary,
  },
});

