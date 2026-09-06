import type { JSX } from 'react';
import type { TextProps } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { Colors, Typography } from '@/constants/theme';

export type TypoVariant = keyof typeof Typography;
export type TypoTone = 'default' | 'secondary' | 'muted' | 'brand' | 'warn' | 'onBrand';

export type TypoProps = TextProps & {
  variant?: TypoVariant;
  tone?: TypoTone;
};

const tones = StyleSheet.create({
  brand: { color: Colors.brand },
  default: { color: Colors.text },
  muted: { color: Colors.muted },
  onBrand: { color: Colors.onBrand },
  secondary: { color: Colors.textSecondary },
  warn: { color: Colors.warn },
});

/**
 * 글자 프리미티브. 크기·굵기·색을 이름으로만 고르게 해서 화면마다 값이 흩어지지 않게 한다.
 * @param props 변형과 톤, 나머지는 Text 그대로
 * @returns 글자
 */
export const Typo = ({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: TypoProps): JSX.Element => <Text {...rest} style={[Typography[variant], tones[tone], style]} />;
