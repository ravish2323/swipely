import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import spacing from '../../theme/spacing';

const SummaryGrid = ({
  stats,
  cardAnimations,
  formatAmount,
  marginBottom = spacing.xxl,
}) => {
  const cards = [
    { key: 'confirmed', label: 'CONFIRMED', value: stats.confirmed.count, amount: formatAmount(stats.confirmed.total), style: styles.confirmedCard },
    { key: 'food', label: 'FOOD', value: stats.food.count, amount: formatAmount(stats.food.total), style: styles.foodCard },
    { key: 'rejected', label: 'REJECTED', value: stats.rejected.count, subtext: 'Not tracked', style: styles.rejectedCard },
    { key: 'special', label: 'SPECIAL', value: stats.special.count, amount: formatAmount(stats.special.total), style: styles.specialCard },
    { key: 'pending', label: 'PENDING', value: stats.pending.count, subtext: 'Awaiting review', style: styles.pendingCard },
  ];

  return (
    <View style={[styles.grid, { marginBottom }]}> 
      {cards.map((card, index) => (
        <Animated.View
          key={card.key}
          style={[
            styles.summaryCard,
            card.style,
            {
              opacity: cardAnimations[index],
              transform: [
                {
                  translateY: cardAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.summaryCardTitle}>{card.label}</Text>
          <Text style={styles.summaryCardValue}>{card.value}</Text>
          {card.amount ? (
            <Text style={styles.summaryCardAmount}>{card.amount}</Text>
          ) : (
            <Text style={styles.summaryCardSubtext}>{card.subtext}</Text>
          )}
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    padding: spacing.xl,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  confirmedCard: {
    backgroundColor: '#e8f7f0',
  },
  foodCard: {
    backgroundColor: '#fff5d9',
  },
  rejectedCard: {
    backgroundColor: '#ffe6e6',
  },
  specialCard: {
    backgroundColor: '#edf0ff',
  },
  pendingCard: {
    backgroundColor: '#e4f8ff',
  },
  summaryCardTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: spacing.sm,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.xs,
  },
  summaryCardAmount: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  summaryCardSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
});

export default SummaryGrid;
