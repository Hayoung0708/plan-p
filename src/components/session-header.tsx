import { router } from 'expo-router';
import { ArrowLeft, List, Settings } from 'lucide-react-native';
import type { JSX } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { Typo } from '@/components/ui/typo';
import { Colors, Radius, Shadow, Spacing, TouchTarget } from '@/constants/theme';
import { formatRemaining } from '@/utils/format';

export type SessionHeaderProps = {
  remaining: number;
  /** 카운터를 눌렀을 때. 후보 목록을 연다 */
  onPressCounter: () => void;
};

const styles = StyleSheet.create({
  // 지도 위에 떠 있는 알약. 남은 후보 수가 항상 보여야 뒤에 뭐가 남았는지 알고 앱을 믿는다
  counter: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    boxShadow: Shadow.float,
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: TouchTarget,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});

/**
 * 안내 화면 상단 바. 남은 후보 수를 항상 보여 준다.
 * @param props 남은 후보 수와 카운터 처리
 * @returns 상단 바
 */
export const SessionHeader = ({ remaining, onPressCounter }: SessionHeaderProps): JSX.Element => (
  <View style={styles.header}>
    <IconButton
      floating
      icon={<ArrowLeft color={Colors.text} size={22} />}
      label="뒤로"
      onPress={(): void => router.back()}
    />
    <Pressable accessibilityRole="button" style={styles.counter} onPress={onPressCounter}>
      <List color={Colors.brand} size={18} />
      <Typo variant="bodyStrong">{formatRemaining(remaining)}</Typo>
    </Pressable>
    <IconButton
      floating
      icon={<Settings color={Colors.text} size={22} />}
      label="설정"
      onPress={(): void => router.push('/settings')}
    />
  </View>
);
