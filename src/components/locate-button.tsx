import { LocateFixed, LocateOff } from 'lucide-react-native';
import type { JSX } from 'react';

import { IconButton } from '@/components/ui/icon-button';
import { Colors } from '@/constants/theme';

export type LocateButtonProps = {
  /** 위치를 읽는 중이면 아이콘을 흐리게 둔다 */
  isLoading: boolean;
  /** 권한이 거부된 상태 */
  isDenied: boolean;
  onPress: () => void;
};

/**
 * 내 위치 버튼.
 *
 * 위치 권한을 여기서 처음 묻는다. 앱을 켜자마자 팝업을 띄우면 맥락 없이 거부당하고,
 * 한 번 거부되면 설정 앱까지 들어가야 복구된다. 사용자가 내 위치를 요구한 순간에 묻는다.
 * @param props 로딩·거부 상태와 누름 처리
 * @returns 플로팅 버튼
 */
export const LocateButton = ({ isLoading, isDenied, onPress }: LocateButtonProps): JSX.Element => (
  <IconButton
    floating
    icon={
      isDenied ? (
        <LocateOff color={Colors.muted} size={22} />
      ) : (
        <LocateFixed color={isLoading ? Colors.muted : Colors.brand} size={22} />
      )
    }
    label="내 위치"
    onPress={onPress}
  />
);
