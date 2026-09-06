import type { JSX } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

/** 큰 글자에서 SUIT ExtraBold은 자간이 벌어 보인다. 크기에 비례해 좁힌다 */
const TRACKING_RATIO = -0.04;
/** 워드마크는 한 줄이라 행간을 글자 크기에 딱 붙여 위아래 여백이 생기지 않게 한다 */
const LINE_HEIGHT_RATIO = 1.15;

const styles = StyleSheet.create({
  mark: { color: Colors.brand, fontFamily: Fonts.displayExtraBold },
});

export type WordmarkProps = {
  /** 글자 크기(px). 나머지 값은 여기에 비례해 따라간다 */
  size?: number;
};

/**
 * plan P 워드마크. 로고를 이미지로 두면 해상도마다 파일이 늘어나서 글꼴로 그린다.
 * @param props size 글자 크기
 * @returns 워드마크 글자
 */
export const Wordmark = ({ size = 28 }: WordmarkProps): JSX.Element => (
  <Text
    accessibilityLabel="plan P"
    accessibilityRole="header"
    style={[
      styles.mark,
      {
        fontSize: size,
        letterSpacing: size * TRACKING_RATIO,
        lineHeight: size * LINE_HEIGHT_RATIO,
      },
    ]}
  >
    plan P
  </Text>
);
