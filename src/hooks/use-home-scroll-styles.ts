import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';
import { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { Colors, Shadow } from '@/constants/theme';

/** 헤더가 흰 바탕으로 바뀌기 시작하는 거리(px). 닿기 직전에만 스며들어야 지도가 답답하지 않다 */
const DOCK_FADE_DISTANCE = 40;

export type HomeScrollStyles = {
  /** 헤더 레이어. 시트가 닿으면 흰 바탕과 밑선 */
  headerStyle: AnimatedStyle<ViewStyle>;
  /** 검색 알약. 떠 있을 땐 그림자, 붙으면 테두리 */
  pillStyle: AnimatedStyle<ViewStyle>;
  /** 위치 버튼. 시트가 올라오기 시작하면 숨긴다 */
  locateStyle: AnimatedStyle<ViewStyle>;
};

/**
 * 홈 시트의 스크롤 위치에 따라 바뀌는 스타일 셋.
 *
 * 시트 윗변이 헤더 밑선에 닿는 순간(dockAt) 헤더는 지도 위에 떠 있는 것에서 화면에 붙은 것으로 바뀐다.
 * 그 전환을 한곳에서 정의해야 세 요소가 같은 타이밍에 움직인다.
 * @param scrollY 시트 스크롤 위치(px)
 * @param dockAt 시트가 헤더에 닿는 스크롤 위치(px)
 * @returns 헤더·알약·위치 버튼의 애니메이션 스타일
 */
export const useHomeScrollStyles = (
  scrollY: SharedValue<number>,
  dockAt: number,
): HomeScrollStyles => {
  const headerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollY.value,
      [dockAt - DOCK_FADE_DISTANCE, dockAt],
      ['rgba(255,255,255,0)', Colors.surface],
    ),
    borderBottomWidth: scrollY.value >= dockAt ? StyleSheet.hairlineWidth : 0,
  }));

  // 헤더가 흰 바탕이 되면 알약은 떠 있는 게 아니라 붙어 있는 것이다. 그림자 대신 테두리로 바꾼다
  const pillStyle = useAnimatedStyle(() => {
    const isDocked = scrollY.value >= dockAt;
    return {
      borderColor: isDocked ? Colors.border : 'rgba(0,0,0,0)',
      boxShadow: isDocked ? 'none' : Shadow.float,
    };
  });

  // 위치 버튼은 자리를 지키되, 시트가 올라와 목록 위에 겹치기 시작하면 사라진다
  const locateStyle = useAnimatedStyle(() => ({
    opacity: scrollY.value > 0 ? 0 : 1,
  }));

  return { headerStyle, pillStyle, locateStyle };
};
