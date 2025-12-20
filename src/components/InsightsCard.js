import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

const InsightsCard = ({ averageConfidence, lastProcessedTimestamp }) => {
  const formatConfidence = (conf) => {
    return `${Math.round((conf || 0) * 100)}%`;
  };

  const formatLastProcessed = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Insights</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Avg Confidence</Text>
          <Text style={styles.value}>{formatConfidence(averageConfidence)}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Last Processed</Text>
          <Text style={styles.value}>{formatLastProcessed(lastProcessedTimestamp)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
  },
  label: {
    ...typography.meta,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default InsightsCard;

