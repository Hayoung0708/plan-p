import type { JSX } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SheetHeader } from '@/components/sheet-header';
import { CANDIDATE_QUEUE } from '@/constants/mock';
import { Colors, Spacing } from '@/constants/theme';
import { formatAvailability, formatFee } from '@/utils/format';

const [, ...REMAINING_LOTS] = CANDIDATE_QUEUE;

const styles = StyleSheet.create({
  detail: { color: Colors.muted, fontSize: 13, marginTop: 2 },
  name: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  notice: { color: Colors.muted, fontSize: 13, marginBottom: Spacing.md },
  row: {
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
  },
  screen: { backgroundColor: Colors.background, flex: 1, padding: Spacing.xl },
  title: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: Spacing.xs },
});

/**
 * 남은 후보 전체 목록. 주행 중에는 열리지 않고 정차 상태에서만 연다.
 * @returns 후보 목록 시트
 */
const CandidatesSheet = (): JSX.Element => (
  <View style={styles.screen}>
    <SheetHeader />
    <Text style={styles.title}>남은 후보 {REMAINING_LOTS.length}곳</Text>
    <Text style={styles.notice}>순서는 현재 위치가 바뀌면 다시 계산됩니다</Text>
    <ScrollView>
      {REMAINING_LOTS.map(({ id, name, walkMinutes, hourlyFee, availability }) => (
        <View key={id} style={styles.row}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.detail}>
            도보 {walkMinutes}분 · {formatFee(hourlyFee)}
          </Text>
          <Text style={styles.detail}>{formatAvailability(availability)}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

export default CandidatesSheet;
