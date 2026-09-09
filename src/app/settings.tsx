import type { JSX } from 'react';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RadiusPicker } from '@/components/radius-picker';
import { SheetHeader } from '@/components/sheet-header';
import { Typo } from '@/components/ui/typo';
import { RADIUS_PRESETS } from '@/constants/parking';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

const styles = StyleSheet.create({
  input: {
    ...Typography.body,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  screen: { backgroundColor: Colors.surface, flex: 1, paddingHorizontal: Spacing.xl },
  section: { gap: Spacing.md, marginBottom: Spacing.xxl },
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
    <SafeAreaView style={styles.screen}>
      <SheetHeader title="설정" />

      <View style={styles.section}>
        <RadiusPicker
          freeOnly={freeOnly}
          walkMinutes={walkMinutes}
          onChangeFreeOnly={setFreeOnly}
          onChangeWalkMinutes={setWalkMinutes}
        />
      </View>

      <View style={styles.section}>
        <Typo tone="muted" variant="label">
          차 높이 (cm)
        </Typo>
        <TextInput
          inputMode="numeric"
          placeholder="예: 155"
          placeholderTextColor={Colors.muted}
          style={styles.input}
          value={heightCm}
          onChangeText={setHeightCm}
        />
        <Typo tone="muted" variant="caption">
          한 번 넣어두면 높이 제한 주차장을 후보에서 자동으로 뺍니다
        </Typo>
      </View>
    </SafeAreaView>
  );
};

export default SettingsSheet;
