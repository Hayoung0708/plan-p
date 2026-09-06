import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HOME_HEADER_HEIGHT,
  SHEET_COLLAPSED_HEIGHT,
  SHEET_EMPTY_HEIGHT,
} from '@/constants/parking';

export type HomeLayout = {
  /** 접힌 시트 높이(px). 검색 전에는 안내 두 줄뿐이라 낮다 */
  sheetHeight: number;
  /** 접힌 시트 위로 보이는 지도 높이(px) */
  mapHeight: number;
  /** 시트 윗변이 헤더 밑선에 닿는 스크롤 위치(px) */
  dockAt: number;
  /** 화면 루트에 달아 실제 높이를 잰다 */
  onLayout: (event: LayoutChangeEvent) => void;
};

/**
 * 홈 화면의 세로 치수.
 *
 * 창 높이가 아니라 실제 레이아웃 높이를 쓴다. 안드로이드는 창 높이에 내비게이션 바가 빠져 있어서
 * 창 높이로 두면 시트가 바닥에서 떠 보인다. 시트 내용은 내비게이션 바 위에 놓여야 하니 그만큼 뺀다.
 * @param hasResults 검색 결과가 있는지. 시트 높이가 달라진다
 * @returns 시트·지도 높이, 도킹 위치, 레이아웃 측정 콜백
 */
export const useHomeLayout = (hasResults: boolean): HomeLayout => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [viewportHeight, setViewportHeight] = useState(height);

  const sheetHeight = hasResults ? SHEET_COLLAPSED_HEIGHT : SHEET_EMPTY_HEIGHT;
  const mapHeight = viewportHeight - sheetHeight - insets.bottom;
  const dockAt = mapHeight - insets.top - HOME_HEADER_HEIGHT;

  return {
    sheetHeight,
    mapHeight,
    dockAt,
    /**
     * 화면 루트의 실제 높이를 기억한다.
     * @param event 레이아웃 이벤트
     * @returns 없음
     */
    onLayout: ({ nativeEvent }: LayoutChangeEvent): void =>
      setViewportHeight(nativeEvent.layout.height),
  };
};
