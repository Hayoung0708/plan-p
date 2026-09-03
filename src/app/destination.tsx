import { router, useLocalSearchParams } from 'expo-router';
import type { JSX } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { DriveButton } from '@/components/drive-button';
import { SheetHeader } from '@/components/sheet-header';
import { CANDIDATE_QUEUE, RADIUS_PRESETS } from '@/constants/mock';
import { Colors, Radius, Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  address: { color: Colors.muted, fontSize: 14, marginTop: Spacing.xs },
  count: { color: Colors.muted, fontSize: 14, marginBottom: Spacing.lg },
  name: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  notice: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    color: Colors.muted,
    fontSize: 14,
    marginVertical: Spacing.lg,
    padding: Spacing.md,
  },
  preset: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  presetOn: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  presetRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  presetText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  presetTextOn: { color: Colors.onBrand },
  screen: { backgroundColor: Colors.background, flex: 1, padding: Spacing.xl },
  sectionTitle: { color: Colors.muted, fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  toggleText: { color: Colors.text, fontSize: 16 },
});

/**
 * 목적지 확인 시트. 검색에서 고른 장소를 받아 반경만 고르게 한다.
 *
 * 건물 자체 주차장 유무와 후보 수는 공공데이터를 붙인 뒤에 채운다.
 * @returns 목적지 시트
 */
const DestinationSheet = (): JSX.Element => {
  const params = useLocalSearchParams<{ name?: string; address?: string }>();
  const [walkMinutes, setWalkMinutes] = useState<number>(RADIUS_PRESETS[1]);
  const [freeOnly, setFreeOnly] = useState(false);
  const { name = '목적지', address = '' } = params;

  return (
    <View style={styles.screen}>
      <SheetHeader title="목적지" />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.address}>{address}</Text>

      <Text style={styles.notice}>건물 주차장 정보는 아직 연결 전입니다</Text>

      <Text style={styles.sectionTitle}>반경</Text>
      <View style={styles.presetRow}>
        {RADIUS_PRESETS.map((preset) => {
          const isOn = preset === walkMinutes;
          return (
            <Pressable
              key={preset}
              style={[styles.preset, isOn && styles.presetOn]}
              onPress={(): void => setWalkMinutes(preset)}
            >
              <Text style={[styles.presetText, isOn && styles.presetTextOn]}>도보 {preset}분</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>무료 주차장만</Text>
        <Switch value={freeOnly} onValueChange={setFreeOnly} />
      </View>

      <Text style={styles.count}>후보 {CANDIDATE_QUEUE.length}곳 (목데이터)</Text>

      <DriveButton label="안내 시작" onPress={(): void => router.replace('/session')} />
    </View>
  );
};

export default DestinationSheet;
