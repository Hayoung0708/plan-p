import { useState } from 'react';

import { RADIUS_PRESETS } from '@/constants/parking';
import { useKakaoNearby } from '@/hooks/use-kakao-nearby';
import { useNearbyLots } from '@/hooks/use-nearby-lots';
import type { MapEvent } from '@/utils/kakao-map-html';
import { distanceMeters, mergeLots } from '@/utils/merge-lots';

export type CandidateRadius = {
  walkMinutes: number;
  /** 사용자가 직접 고른 반경. 이후로는 자동으로 넓히지 않는다 */
  pickWalkMinutes: (minutes: number) => void;
  /** 조회가 끝난 뒤의 후보 수. 조회 중에는 이전 값을 유지해 버튼이 깜빡이지 않는다. 첫 조회 전엔 null */
  count: number | null;
  isLoading: boolean;
  error: string;
  /** 지도가 준비됐는지. 그 전까지는 스켈레톤을 덮는다 */
  isMapReady: boolean;
  handleMapEvent: (event: MapEvent) => void;
};

// 튜플 그대로는 indexOf에 number를 넣을 수 없다
const PRESETS: readonly number[] = RADIUS_PRESETS;

/**
 * 목적지 후보 조회. 가장 좁은 반경부터 시작해서 후보가 없으면 다음 반경으로 넓힌다.
 * 사용자가 반경을 한 번이라도 직접 고르면 그때부터는 그 값을 그대로 둔다.
 *
 * 상태 조정은 effect가 아니라 렌더 중에 한다. effect로 하면 이전 값이 한 프레임 그려졌다가 바뀐다.
 * @param params 목적지 좌표, 무료 여부, 목적지 건물의 주차면 수
 * @returns 반경·후보 수·조회 상태
 */
export const useCandidateRadius = ({
  lat,
  lng,
  freeOnly,
  buildingSpaces,
}: {
  lat: number;
  lng: number;
  freeOnly: boolean;
  buildingSpaces: number;
}): CandidateRadius => {
  const [walkMinutes, setWalkMinutes] = useState<number>(RADIUS_PRESETS[0]);
  const [hasPicked, setHasPicked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const { lots, isLoading, error } = useNearbyLots({ lat, lng, walkMinutes, freeOnly });
  // 안내 화면과 같은 기준으로 세야 후보 수가 어긋나지 않는다
  const { lots: kakaoLots, handleMapEvent } = useKakaoNearby({ lat, lng }, distanceMeters);
  const candidates = freeOnly ? lots : mergeLots(lots, kakaoLots);
  // 건물에 주차장이 있으면 그곳이 첫 후보다. 수에 넣어야 버튼과 문구가 안내 화면과 어긋나지 않는다
  const total = candidates.length + (buildingSpaces > 0 ? 1 : 0);

  if (!isLoading && total !== count) {
    setCount(total);
  }
  const next = PRESETS[PRESETS.indexOf(walkMinutes) + 1];
  if (!isLoading && total === 0 && error === '' && !hasPicked && next !== undefined) {
    setWalkMinutes(next);
  }

  /**
   * 사용자가 반경을 고른다. 이후 자동 확장은 멈춘다.
   * @param minutes 도보 분
   */
  const pickWalkMinutes = (minutes: number): void => {
    setHasPicked(true);
    setWalkMinutes(minutes);
  };

  /**
   * 지도 이벤트. 준비 신호는 스켈레톤을 걷는 데 쓰고 나머지는 주변 주차장 조회로 넘긴다.
   * @param event 지도 이벤트
   */
  const handleMap = (event: MapEvent): void => {
    if (event.type === 'ready') {
      setIsMapReady(true);
    }
    handleMapEvent(event);
  };

  return {
    walkMinutes,
    pickWalkMinutes,
    count,
    isLoading,
    error,
    isMapReady,
    handleMapEvent: handleMap,
  };
};
