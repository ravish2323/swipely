import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../../theme/spacing';

const BottomBar = ({
  showActionButtons,
  hasCards,
  onCloseActions,
  onReject,
  onFavorite,
  onFood,
  onConfirm,
  onSummaryPress,
  onOpenActions,
  paddingHorizontal = spacing.xl,
  paddingVertical = spacing.lg,
}) => {
  return (
    <>
      {hasCards && showActionButtons && (
        <TouchableOpacity
          style={styles.actionBarOverlay}
          activeOpacity={1}
          onPress={onCloseActions}
        >
          <View
            style={[
              styles.bottomActionBar,
              { paddingHorizontal, paddingVertical },
            ]}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <TouchableOpacity style={[styles.actionPill, styles.rejectPill]} onPress={onReject}>
              <Ionicons name="close-outline" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, styles.favoritePill]} onPress={onFavorite}>
              <Ionicons name="star-outline" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, styles.foodPill]} onPress={onFood}>
              <Ionicons name="restaurant-outline" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, styles.confirmPill]} onPress={onConfirm}>
              <Ionicons name="checkmark-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {!showActionButtons && (
        <View
          style={[
            styles.bottomInfoBar,
            { paddingHorizontal, paddingVertical },
          ]}
        >
          <TouchableOpacity 
            style={[styles.summaryButton, !hasCards && styles.summaryButtonFull]} 
            onPress={onSummaryPress}
          >
            <Text style={styles.summaryButtonText}>Summary</Text>
          </TouchableOpacity>
          {hasCards && (
            <TouchableOpacity style={styles.starButton} onPress={onOpenActions}>
              <Ionicons name="star-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  actionBarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectPill: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  favoritePill: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1.5,
    borderColor: '#A5B4FC',
  },
  foodPill: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  confirmPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  bottomInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: spacing.sm,
  },
  summaryButton: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryButtonFull: {
    flex: 1,
  },
  summaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
    letterSpacing: 0.3,
  },
  starButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomBar;
