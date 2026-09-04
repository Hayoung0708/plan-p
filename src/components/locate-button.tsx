import { LocateFixed, LocateOff } from 'lucide-react-native';
import type { JSX } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

export type LocateButtonProps = {
  /** 위치를 읽는 중이면 아이콘을 흐리게 둔다 */
  isLoading: boolean;
  /** 권한이 거부된 상태 */
  isDenied: boolean;
  onPress: () => void;
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    elevation: 4,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    width: 44,
  },
  pressed: { backgroundColor: Colors.surface },
});

/**
 * 내 위치 버튼.
 *
 * 위치 권한을 여기서 처음 묻는다. 앱을 켜자마자 팝업을 띄우면 맥락 없이 거부당하고,
 * 한 번 거부되면 설정 앱까지 들어가야 복구된다. 사용자가 내 위치를 요구한 순간에 묻는다.
 * @param props 로딩·거부 상태와 누름 처리
 * @returns 플로팅 버튼
 */
export const LocateButton = ({ isLoading, isDenied, onPress }: LocateButtonProps): JSX.Element => (
  <Pressable
    accessibilityLabel="내 위치"
    accessibilityRole="button"
    style={({ pressed }): (object | false)[] => [styles.button, pressed && styles.pressed]}
    onPress={onPress}
  >
    {isDenied ? (
      <LocateOff color={Colors.muted} size={22} />
    ) : (
      <LocateFixed color={isLoading ? Colors.muted : Colors.brand} size={22} />
    )}
  </Pressable>
);
