import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarCelebration from './StarCelebration';
import spacing from '../../theme/spacing';

const CardStage = ({
  hasCards,
  renderCard,
  renderEmptyState,
  renderCompletion,
  renderEyeButton,
  paddingHorizontal = spacing.xl,
  paddingVertical = spacing.xl,
}) => {
  // Default empty state uses StarCelebration
  const defaultEmptyState = (
    <StarCelebration
      title="All Done!"
      subtitle="You've processed all transactions for this period."
    />
  );

  // Default eye button with count - shown above card area
  const defaultEyeButton = renderEyeButton ? (
    renderEyeButton()
  ) : null;

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal,
          paddingVertical,
        },
      ]}
    >
      {hasCards ? (
        <>
          {/* Pill with count and eye button above card area */}
          {defaultEyeButton}
          {/* Card area - reduced size to accommodate pill above */}
          <View style={styles.cardArea}>
            {renderCard && renderCard()}
          </View>
        </>
      ) : (
        <>
          {renderEmptyState ? renderEmptyState() : defaultEmptyState}
          {renderCompletion && renderCompletion()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  cardArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 0,
    overflow: 'visible',
  },
});

export default CardStage;
