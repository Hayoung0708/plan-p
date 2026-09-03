import type { JSX } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, DriveButtonHeight, Radius } from '@/constants/theme';

type DriveButtonProps = {
  label: string;
  onPress: () => void;
  /** 화면의 주된 행동이 아닐 때 약하게 표시한다 */
  tone?: 'primary' | 'muted';
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: DriveButtonHeight,
    justifyContent: 'center',
    width: '100%',
  },
  label: { fontSize: 20, fontWeight: '700' },
  mutedBox: { backgroundColor: Colors.surface },
  mutedLabel: { color: Colors.text },
  pressed: { opacity: 0.7 },
  primaryBox: { backgroundColor: Colors.brand },
  primaryLabel: { color: Colors.onBrand },
});

/**
 * 주행 중 엄지로 누르는 큰 버튼. 화면이 바뀌어도 위치·크기가 고정이라
 * 사용자가 화면을 안 보고도 같은 자리를 누를 수 있다.
 * @param props 라벨, 누름 처리, 강조 톤
 * @returns 버튼
 */
export const DriveButton = ({
  label,
  onPress,
  tone = 'primary',
}: DriveButtonProps): JSX.Element => {
  const isPrimary = tone === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primaryBox : styles.mutedBox,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.mutedLabel]}>
        {label}
      </Text>
    </Pressable>
  );
};
