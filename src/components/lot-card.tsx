import { Footprints, Gauge, Wallet } from 'lucide-react-native';
import type { JSX } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Typo } from '@/components/ui/typo';
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
  onParked: () => void;
};

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    backgroundColor: Colors.warnSoft,
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  card: { gap: Spacing.lg },
  factItem: { alignItems: 'center', flexDirection: 'row', gap: Spacing.xs },
  facts: { alignItems: 'center', flexDirection: 'row', gap: Spacing.lg },
  head: { gap: Spacing.xs },
});

/**
 * 안내 화면 하단 카드. 현재 목적지 하나와 만차 버튼만 둔다.
 * @param props 현재 후보, 남은 후보 수, 만차·완료 처리
 * @returns 안내 카드
 */
export const LotCard = ({ lot, remaining, onFull, onParked }: LotCardProps): JSX.Element => (
  <Card floating style={styles.card}>
    {remaining <= LOW_CANDIDATE_THRESHOLD && (
      <View style={styles.banner}>
        <Gauge color={Colors.warn} size={16} />
        <Typo tone="warn" variant="caption">
          후보가 {remaining}곳 남았어요 · 반경 넓히기
        </Typo>
      </View>
    )}

    <View style={styles.head}>
      <Typo tone="muted" variant="label">
        지금 가는 곳
      </Typo>
      <Typo numberOfLines={1} variant="title">
        {lot.name}
      </Typo>
    </View>

    <View style={styles.facts}>
      <View style={styles.factItem}>
        <Footprints color={Colors.textSecondary} size={16} />
        <Typo tone="secondary" variant="caption">
          도보 {walkMinutesFromMeters(lot.distance_m)}분
        </Typo>
      </View>
      <View style={styles.factItem}>
        <Wallet color={Colors.textSecondary} size={16} />
        <Typo tone="secondary" variant="caption">
          {formatFee(lot)}
        </Typo>
      </View>
      <Typo tone="muted" variant="caption">
        {formatSpaces(lot.total_spaces)}
      </Typo>
    </View>

    <Button label="만차예요" size="drive" onPress={onFull} />
    <Button label="주차 완료" variant="ghost" onPress={onParked} />
  </Card>
);
