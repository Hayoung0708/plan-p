import type { JSX } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Motion, Radius, Spacing, TouchTarget, Typography } from '@/constants/theme';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: TouchTarget,
    paddingHorizontal: Spacing.lg,
  },
  pressed: { opacity: 0.8 },
});

/**
 * 고르는 알약. 반경 프리셋처럼 몇 개 중 하나를 택할 때 쓴다.
 * 선택이 옮겨갈 때 색이 툭 바뀌지 않고 스며들도록 바탕과 글자 색을 같이 보간한다.
 * @param props 라벨·선택 여부·행동
 * @returns 알약 버튼
 */
export const Chip = ({ label, selected, onPress }: ChipProps): JSX.Element => {
  const progress = useDerivedValue(() => withTiming(selected ? 1 : 0, { duration: Motion.base }));
  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.surfaceAlt, Colors.text]),
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [Colors.textSecondary, Colors.onBrand]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }): (object | false)[] => [styles.base, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.base, boxStyle]} />
      <Animated.Text style={[Typography.bodyStrong, textStyle]}>{label}</Animated.Text>
    </Pressable>
  );
};
