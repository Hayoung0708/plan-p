import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export type SheetHeaderProps = {
  /** 가운데 제목. 비우면 뒤로가기만 남는다 */
  title?: string;
};

const styles = StyleSheet.create({
  back: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backPressed: { backgroundColor: Colors.surface },
  // 뒤로가기 버튼과 같은 폭을 반대편에 둬서 제목이 화면 가운데로 온다
  spacer: { width: 40 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});

/**
 * 시트 상단 바. 웹에서는 모달이 전체 화면으로 떠서 뒤로가기가 없으면 나갈 방법이 없다.
 * @param props 제목
 * @returns 상단 바
 */
export const SheetHeader = ({ title = '' }: SheetHeaderProps): JSX.Element => (
  <View style={styles.header}>
    <Pressable
      accessibilityLabel="뒤로"
      accessibilityRole="button"
      style={({ pressed }): (object | false)[] => [styles.back, pressed && styles.backPressed]}
      onPress={(): void => router.back()}
    >
      <ArrowLeft color={Colors.text} size={22} />
    </Pressable>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.spacer} />
  </View>
);
