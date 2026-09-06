import type { JSX } from 'react';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Motion } from '@/constants/theme';

export type SkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

/** 숨쉬듯 밝아졌다 어두워지는 한 주기(ms). 너무 빠르면 깜빡임처럼 보인다 */
const PULSE_DURATION = 900;

const styles = StyleSheet.create({
  base: { backgroundColor: Colors.surfaceAlt },
});

/**
 * 내용이 오기 전 자리를 잡아 두는 회색 블록. 사라질 때는 스르륵 빠진다.
 * @param props 크기·위치 스타일
 * @returns 스켈레톤 블록
 */
export const Skeleton = ({ style }: SkeletonProps): JSX.Element => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.set(withRepeat(withTiming(0.45, { duration: PULSE_DURATION }), -1, true));
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      exiting={FadeOut.duration(Motion.base)}
      style={[styles.base, style, pulseStyle]}
    />
  );
};
