import { X } from 'lucide-react-native';
import type { JSX } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { Typo } from '@/components/ui/typo';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { NearbyLot } from '@/types/parking';
import { walkMinutesFromMeters } from '@/utils/distance';
import { formatFee, formatSpaces } from '@/utils/format';

export type CandidatesSheetProps = {
  /** 아직 안 가본 후보 */
  lots: NearbyLot[];
  isVisible: boolean;
  onClose: () => void;
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: Colors.scrim, flex: 1, justifyContent: 'flex-end' },
  handle: {
    alignSelf: 'center',
    backgroundColor: Colors.border,
    borderRadius: Radius.pill,
    height: 5,
    marginBottom: Spacing.lg,
    width: 40,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  list: { gap: Spacing.sm, paddingBottom: Spacing.xl },
  order: {
    alignItems: 'center',
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  row: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  rowBody: { flex: 1, gap: 2 },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '75%',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  titleRow: { alignItems: 'baseline', flexDirection: 'row', gap: Spacing.sm },
});

/**
 * 남은 후보 전체 목록. 안내 화면의 후보를 그대로 받아 쓰기 때문에
 * 카운터에 뜬 수와 목록 길이가 항상 같다.
 * @param props 후보 목록과 열림 여부
 * @returns 후보 목록 시트
 */
export const CandidatesSheet = ({
  lots,
  isVisible,
  onClose,
}: CandidatesSheetProps): JSX.Element => (
  <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Typo variant="title">남은 후보</Typo>
            <Typo tone="brand" variant="title">
              {lots.length}
            </Typo>
          </View>
          <IconButton icon={<X color={Colors.muted} size={22} />} label="닫기" onPress={onClose} />
        </View>
        <Typo style={{ marginBottom: Spacing.lg }} tone="muted" variant="caption">
          순서는 현재 위치가 바뀌면 다시 계산됩니다
        </Typo>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {lots.map((lot, order) => (
            <View key={lot.code} style={styles.row}>
              <View style={styles.order}>
                <Typo tone="brand" variant="label">
                  {order + 2}
                </Typo>
              </View>
              <View style={styles.rowBody}>
                <Typo numberOfLines={1} variant="bodyStrong">
                  {lot.name}
                </Typo>
                <Typo tone="secondary" variant="caption">
                  도보 {walkMinutesFromMeters(lot.distance_m)}분 · {formatFee(lot)} ·{' '}
                  {formatSpaces(lot.total_spaces)}
                </Typo>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Pressable>
  </Modal>
);
