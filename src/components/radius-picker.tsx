import type { JSX } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Toggle } from '@/components/ui/toggle';
import { Typo } from '@/components/ui/typo';
import { RADIUS_PRESETS } from '@/constants/parking';
import { Spacing } from '@/constants/theme';

export type RadiusPickerProps = {
  walkMinutes: number;
  freeOnly: boolean;
  onChangeWalkMinutes: (minutes: number) => void;
  onChangeFreeOnly: (value: boolean) => void;
};

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: Spacing.sm },
  root: { gap: Spacing.xl },
  section: { gap: Spacing.md },
  toggleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});

/**
 * 반경 프리셋과 무료 토글. 사용자가 만지는 조건은 이 둘뿐이라 한 덩어리로 둔다.
 * 목적지 시트와 설정 화면이 같은 모양을 쓴다.
 * @param props 현재 값과 변경 처리
 * @returns 조건 선택 영역
 */
export const RadiusPicker = ({
  walkMinutes,
  freeOnly,
  onChangeWalkMinutes,
  onChangeFreeOnly,
}: RadiusPickerProps): JSX.Element => (
  <View style={styles.root}>
    <View style={styles.section}>
      <Typo tone="muted" variant="label">
        도보 반경
      </Typo>
      <View style={styles.chips}>
        {RADIUS_PRESETS.map((preset) => (
          <Chip
            key={preset}
            label={`${preset}분`}
            selected={preset === walkMinutes}
            onPress={(): void => onChangeWalkMinutes(preset)}
          />
        ))}
      </View>
    </View>

    <View style={styles.toggleRow}>
      <Typo variant="body">무료 주차장만</Typo>
      <Toggle label="무료 주차장만" value={freeOnly} onChange={onChangeFreeOnly} />
    </View>
  </View>
);
