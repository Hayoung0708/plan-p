import type { JSX, ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

export type CardProps = {
  children: ReactNode;
  /** 지도 위에 떠 있는 카드는 그림자를 더 준다 */
  floating?: boolean;
  style?: ViewStyle;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    boxShadow: Shadow.card,
    padding: Spacing.lg,
  },
  floating: { boxShadow: Shadow.float },
});

/**
 * 흰 면 하나. 모서리와 그림자를 통일하려고 둔다.
 * @param props 내용과 떠 있음 여부
 * @returns 카드
 */
export const Card = ({ children, floating = false, style }: CardProps): JSX.Element => (
  <View style={[styles.base, floating && styles.floating, style]}>{children}</View>
);
