import { Easing } from 'react-native';

export const durations = {
  fast: 140,
  normal: 220,
  slow: 320,
};

export const easing = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
};

export const swipeThresholds = {
  distanceThresholdX: 110,
  distanceThresholdY: 110,
  velocityThreshold: 0.65,
};

export const springConfig = {
  speed: 18,
  bounciness: 8,
};

