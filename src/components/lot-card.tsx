import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DriveButton } from '@/components/drive-button';
import { LOW_CANDIDATE_THRESHOLD } from '@/constants/parking';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { NearbyLot } from '@/types/parking';
import { walkMinutesFromMeters } from '@/utils/distance';
import { formatFee, formatSpaces } from '@/utils/format';

export type LotCardProps = {
  lot: NearbyLot;
  /** 아직 안 가본 후보 수 */
  remaining: number;
  onFull: () => void;
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    color: Colors.warn,
    fontSize: 14,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  card: { gap: Spacing.md, padding: Spacing.lg },
  detail: { color: Colors.muted, fontSize: 15, marginTop: Spacing.xs },
  name: { color: Colors.text, fontSize: 22, fontWeight: '700' },
});

/**
 * 안내 화면 하단 카드. 현재 목적지 하나와 만차 버튼만 둔다.
 * @param props 현재 후보, 남은 후보 수, 만차 처리
 * @returns 안내 카드
 */
export const LotCard = ({ lot, remaining, onFull }: LotCardProps): JSX.Element => (
  <View style={styles.card}>
    {remaining <= LOW_CANDIDATE_THRESHOLD && (
      <Text style={styles.banner}>후보가 {remaining}곳 남았어요 · 반경 넓히기</Text>
    )}
    <Text style={styles.name}>{lot.name}</Text>
    <Text style={styles.detail}>
      도보 {walkMinutesFromMeters(lot.distance_m)}분 · {formatFee(lot)}
    </Text>
    <Text style={styles.detail}>{formatSpaces(lot.total_spaces)} · 실시간 정보 없음</Text>

    <DriveButton label="만차예요" onPress={onFull} />
  </View>
);
