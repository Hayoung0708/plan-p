import type { JSX } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Colors, Radius, Shadow, TouchTarget } from '@/constants/theme';

export type IconButtonProps = {
  icon: JSX.Element;
  /** 스크린리더용 이름. 아이콘만 있는 버튼은 이게 없으면 뭔지 모른다 */
  label: string;
  onPress: () => void;
  /** 지도 위에 떠 있을 때는 그림자를 준다 */
  floating?: boolean;
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: TouchTarget,
    justifyContent: 'center',
    width: TouchTarget,
  },
  floating: { backgroundColor: Colors.surface, boxShadow: Shadow.float },
  pressed: { backgroundColor: Colors.surfaceAlt },
});

/**
 * 아이콘 하나짜리 원형 버튼. 헤더와 플로팅 버튼이 같은 모양을 쓴다.
 * @param props 아이콘·이름·행동
 * @returns 버튼
 */
export const IconButton = ({
  icon,
  label,
  onPress,
  floating = false,
}: IconButtonProps): JSX.Element => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    style={({ pressed }): (object | false)[] => [
      styles.base,
      floating && styles.floating,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
  >
    {icon}
  </Pressable>
);
