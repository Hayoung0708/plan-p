import type { JSX } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Motion, Radius } from '@/constants/theme';

export type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  /** 스크린리더용 이름 */
  label: string;
};

/** 트랙 크기. 손잡이는 트랙 안쪽에 여백을 두고 들어간다 */
const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const THUMB_INSET = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;

const styles = StyleSheet.create({
  thumb: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.25)',
    height: THUMB_SIZE,
    left: THUMB_INSET,
    position: 'absolute',
    top: THUMB_INSET,
    width: THUMB_SIZE,
  },
  track: {
    borderRadius: Radius.pill,
    height: TRACK_HEIGHT,
    width: TRACK_WIDTH,
  },
});

/**
 * 스위치. 손잡이가 트랙보다 작게 안쪽에 들어가는 모양이다.
 * RN 기본 Switch는 플랫폼마다 생김새가 달라 웹에선 손잡이가 트랙 밖으로 튀어나온다.
 * @param props 값·변경 처리·이름
 * @returns 스위치
 */
export const Toggle = ({ value, onChange, label }: ToggleProps): JSX.Element => {
  // 0(꺼짐)에서 1(켜짐)로 미끄러지는 진행도. 손잡이 위치와 트랙 색이 같은 값을 본다
  const progress = useDerivedValue(() => withTiming(value ? 1 : 0, { duration: Motion.base }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.border, Colors.brand]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={(): void => onChange(!value)}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};
