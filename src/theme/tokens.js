import { Platform } from 'react-native';

export const colors = {
  primary: '#7C5CFA',
  primarySoft: '#F3F0FF',
  bg: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  successBg: '#E8F7F0',
  rejectBg: '#FFECEC',
  foodBg: '#FFF4D6',
  specialBg: '#EDF0FF',
  shadow: 'rgba(17,24,39,0.10)',
};

export const radii = {
  card: 24,
  pill: 999,
  button: 18,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const typography = {
  title: {
    fontSize: Platform.OS === 'ios' ? 32 : 30,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'SpaceGrotesk_600SemiBold',
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold',
    fontWeight: '600',
  },
  body: {
    fontSize: Platform.OS === 'ios' ? 15 : 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_400Regular',
    fontWeight: '400',
  },
  meta: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_500Medium',
    fontWeight: '500',
  },
};

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  }),
  button: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
};

