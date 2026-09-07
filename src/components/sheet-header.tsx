import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { JSX } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { Typo } from '@/components/ui/typo';
import { Colors, Spacing, TouchTarget } from '@/constants/theme';

export type SheetHeaderProps = {
  /** 가운데 제목. 비우면 뒤로가기만 남는다 */
  title?: string;
};

const ICON_SIZE = 22;

const styles = StyleSheet.create({
  // 원형 버튼의 여백만큼 왼쪽으로 당겨서 아이콘 자체가 본문 왼쪽 선에 맞는다
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginLeft: -(TouchTarget - ICON_SIZE) / 2,
    paddingBottom: Spacing.xs,
    paddingTop: Spacing.lg,
  },
  // 뒤로가기 버튼과 같은 폭을 반대편에 둬서 제목이 화면 가운데로 온다
  spacer: { width: TouchTarget },
});

/**
 * 시트 상단 바. 웹에서는 모달이 전체 화면으로 떠서 뒤로가기가 없으면 나갈 방법이 없다.
 * @param props 제목
 * @returns 상단 바
 */
export const SheetHeader = ({ title = '' }: SheetHeaderProps): JSX.Element => (
  <View style={styles.header}>
    <IconButton
      icon={<ArrowLeft color={Colors.text} size={ICON_SIZE} />}
      label="뒤로"
      onPress={(): void => router.back()}
    />
    {title !== '' && <Typo variant="bodyStrong">{title}</Typo>}
    <View style={styles.spacer} />
  </View>
);
