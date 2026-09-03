import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type MapPlaceholderProps = {
  /** 아직 안 가본 후보 수. 작은 점으로만 찍어 뒤에 뭐가 남았는지 보여준다 */
  remaining: number;
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
  current: { color: Colors.brand, fontSize: 32 },
  dots: { color: Colors.muted, fontSize: 20, letterSpacing: Spacing.sm, marginTop: Spacing.sm },
  note: { color: Colors.muted, fontSize: 12, marginTop: Spacing.sm },
});

/**
 * 지도 자리. 카카오맵 SDK를 붙이기 전까지 후보 분포만 흉내 낸다.
 * @param props 남은 후보 수
 * @returns 지도 자리 뷰
 */
export const MapPlaceholder = ({ remaining }: MapPlaceholderProps): JSX.Element => (
  <View style={styles.box}>
    <Text style={styles.current}>◉</Text>
    <Text style={styles.dots}>{'·'.repeat(Math.max(remaining, 0))}</Text>
    <Text style={styles.note}>지도 (카카오맵 SDK 연결 예정)</Text>
  </View>
);
