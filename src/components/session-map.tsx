import type { JSX } from 'react';

import { KakaoMap } from '@/components/kakao-map';
import { useDrivingRoute } from '@/hooks/use-driving-route';
import { ROUTE_PREVIEW_COUNT } from '@/constants/parking';
import type { NearbyLot } from '@/types/parking';
import type { MapEvent } from '@/utils/kakao-map-html';
import { toPins, toRoutePath } from '@/utils/map-pins';

export type SessionMapProps = {
  candidates: NearbyLot[];
  /** 현재 안내 중인 후보의 순서 */
  index: number;
  /** 현재 위치. 없으면 경로 미리보기는 현재 후보에서 시작한다 */
  location: { lat: number; lng: number } | null;
  /** 민영 주차장을 찾을 중심과 반경(m) */
  nearby: { lat: number; lng: number; radius: number };
  onEvent: (event: MapEvent) => void;
};

/**
 * 안내 화면의 지도. 후보 전체를 점으로 찍고 앞쪽 3곳까지 경로를 미리 보여 준다.
 * @param props 후보와 현재 위치, 지도 이벤트 처리
 * @returns 지도
 */
export const SessionMap = ({
  candidates,
  index,
  location,
  nearby,
  onEvent,
}: SessionMapProps): JSX.Element => {
  // 직선으로 이은 순서 경로. 길찾기가 오기 전과 실패했을 때 쓰는 값이다
  const stops = toRoutePath(candidates, index, location, ROUTE_PREVIEW_COUNT);
  const { route } = useDrivingRoute(stops);

  // 첫 구간은 지금 가야 할 길이라 실선으로, 나머지는 미리보기라 점선으로 나눠 그린다
  const [activeSection, ...previewSections] = route?.sections ?? [];

  return (
    <KakaoMap
      activePath={activeSection ?? stops.slice(0, 2)}
      keyword=""
      nearby={nearby}
      path={route === null ? stops.slice(1) : previewSections.flat()}
      pins={toPins(candidates, index, ROUTE_PREVIEW_COUNT)}
      onEvent={onEvent}
    />
  );
};
