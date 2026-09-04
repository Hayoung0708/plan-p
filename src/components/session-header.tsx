import { router } from 'expo-router';
import { ArrowLeft, Settings } from 'lucide-react-native';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { formatRemaining } from '@/utils/format';

export type SessionHeaderProps = {
  remaining: number;
  /** 카운터를 눌렀을 때. 후보 목록을 연다 */
  onPressCounter: () => void;
};

const styles = StyleSheet.create({
  counter: { color: Colors.text, fontSize: 16, fontWeight: '700' },
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
 * 뒤에 뭐가 남았는지 모르면 앱을 안 믿고 직접 검색하게 된다.
 * @param props 남은 후보 수와 카운터 처리
 * @returns 상단 바
 */
export const SessionHeader = ({ remaining, onPressCounter }: SessionHeaderProps): JSX.Element => (
  <View style={styles.header}>
    <Pressable
      accessibilityLabel="뒤로"
      accessibilityRole="button"
      onPress={(): void => router.replace('/')}
    >
      <ArrowLeft color={Colors.muted} size={22} />
    </Pressable>
    <Pressable accessibilityRole="button" onPress={onPressCounter}>
      <Text style={styles.counter}>{formatRemaining(remaining)}</Text>
    </Pressable>
    <Pressable
      accessibilityLabel="설정"
      accessibilityRole="button"
      onPress={(): void => router.push('/settings')}
    >
      <Settings color={Colors.muted} size={22} />
    </Pressable>
  </View>
);
