import type { JSX } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { Typo } from '@/components/ui/typo';
import {
  Colors,
  DriveButtonHeight,
  Motion,
  Radius,
  Shadow,
  Spacing,
  TouchTarget,
} from '@/constants/theme';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  /** primary는 화면의 주된 행동 하나에만 쓴다 */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** drive는 주행 중 엄지로 누르는 크기 */
  size?: 'md' | 'drive';
  /** 라벨 왼쪽 아이콘 */
  icon?: JSX.Element;
  disabled?: boolean;
};

const DISABLED_OPACITY = 0.45;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    width: '100%',
  },
  drive: { height: DriveButtonHeight },
  ghost: { backgroundColor: 'transparent' },
  md: { height: 52, minHeight: TouchTarget },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  primary: { backgroundColor: Colors.brand, boxShadow: Shadow.float },
  secondary: { backgroundColor: Colors.surfaceAlt },
});

/**
 * 버튼. 변형 셋, 크기 둘뿐이다. 그 밖의 모양이 필요하면 디자인이 틀린 거다.
 * 비활성 전환은 시간을 두고 흐려진다. 조회할 때마다 켜졌다 꺼졌다 하면 깜빡이는 것처럼 보인다.
 * @param props 라벨·행동·변형·크기
 * @returns 버튼
 */
export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
}: ButtonProps): JSX.Element => {
  const tone = variant === 'primary' ? 'onBrand' : variant === 'ghost' ? 'secondary' : 'default';
  const opacity = useDerivedValue(() =>
    withTiming(disabled ? DISABLED_OPACITY : 1, { duration: Motion.base }),
  );
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={fadeStyle}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        style={({ pressed }): (object | false)[] => [
          styles.base,
          styles[variant],
          styles[size],
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        {icon !== undefined && <View>{icon}</View>}
        <Typo tone={tone} variant={size === 'drive' ? 'heading' : 'bodyStrong'}>
          {label}
        </Typo>
      </Pressable>
    </Animated.View>
  );
};
