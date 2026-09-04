import type { JSX } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { SheetHeader } from '@/components/sheet-header';
import { RADIUS_PRESETS } from '@/constants/parking';
import { Colors, Radius, Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    color: Colors.text,
    fontSize: 16,
    padding: Spacing.md,
  },
  label: { color: Colors.muted, fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  note: { color: Colors.muted, fontSize: 13, marginTop: Spacing.sm },
  preset: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  presetOn: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  presetRow: { flexDirection: 'row', gap: Spacing.sm },
  presetText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  presetTextOn: { color: Colors.onBrand },
  screen: { backgroundColor: Colors.background, flex: 1, padding: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  toggleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  toggleText: { color: Colors.text, fontSize: 16 },
});

/**
 * 설정 시트. 사용자가 만지는 값은 반경, 무료 토글, 차 높이 셋뿐이다.
 * @returns 설정 시트
 */
const SettingsSheet = (): JSX.Element => {
  const [walkMinutes, setWalkMinutes] = useState<number>(RADIUS_PRESETS[1]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [heightCm, setHeightCm] = useState('');

  return (
    <View style={styles.screen}>
      <SheetHeader title="설정" />

      <View style={styles.section}>
        <Text style={styles.label}>기본 반경</Text>
        <View style={styles.presetRow}>
          {RADIUS_PRESETS.map((preset) => {
            const isOn = preset === walkMinutes;
            return (
              <Pressable
                key={preset}
                style={[styles.preset, isOn && styles.presetOn]}
                onPress={(): void => setWalkMinutes(preset)}
              >
                <Text style={[styles.presetText, isOn && styles.presetTextOn]}>
                  도보 {preset}분
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>무료 주차장만</Text>
          <Switch value={freeOnly} onValueChange={setFreeOnly} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>차 높이 (cm)</Text>
        <TextInput
          inputMode="numeric"
          placeholder="예: 155"
          placeholderTextColor={Colors.muted}
          style={styles.input}
          value={heightCm}
          onChangeText={setHeightCm}
        />
        <Text style={styles.note}>한 번 넣어두면 높이 제한 주차장을 후보에서 자동으로 뺍니다</Text>
      </View>
    </View>
  );
};

export default SettingsSheet;
