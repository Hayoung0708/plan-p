import { X } from 'lucide-react';
import type { JSX } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  backdrop: { backgroundColor: '#00000055', flex: 1, justifyContent: 'flex-end' },
  detail: { color: Colors.muted, fontSize: 13, marginTop: 2 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  name: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  notice: { color: Colors.muted, fontSize: 13, marginBottom: Spacing.md },
  row: {
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: '70%',
    padding: Spacing.xl,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '700' },
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
        <View style={styles.header}>
          <Text style={styles.title}>남은 후보 {lots.length}곳</Text>
          <Pressable accessibilityLabel="닫기" accessibilityRole="button" onPress={onClose}>
            <X color={Colors.muted} size={22} />
          </Pressable>
        </View>
        <Text style={styles.notice}>순서는 현재 위치가 바뀌면 다시 계산됩니다</Text>
        <ScrollView>
          {lots.map((lot) => (
            <View key={lot.code} style={styles.row}>
              <Text style={styles.name}>{lot.name}</Text>
              <Text style={styles.detail}>
                도보 {walkMinutesFromMeters(lot.distance_m)}분 · {formatFee(lot)}
              </Text>
              <Text style={styles.detail}>{formatSpaces(lot.total_spaces)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Pressable>
  </Modal>
);
