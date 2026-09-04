import { useCallback, useState } from 'react';

import type { NearbyLot } from '@/types/parking';
import type { MapEvent, MapPlace } from '@/utils/kakao-map-html';

/**
 * 카카오에서 온 주차장을 후보와 같은 모양으로 바꾼다.
 * 요금·주차면은 카카오가 주지 않아 비워 둔다.
 * @param place 카카오 장소
 * @param distanceM 목적지까지 직선거리(m)
 * @returns 후보 하나
 */
const toLot = (place: MapPlace, distanceM: number): NearbyLot => ({
  code: `kakao:${place.id}`,
  name: place.name,
  address: place.address,
  total_spaces: null,
  base_fee: null,
  base_minutes: null,
  charge_type: null,
  lot_type: null,
  lat: place.lat,
  lng: place.lng,
  distance_m: distanceM,
});

export type KakaoNearbyState = {
  /** 카카오에서 조회한 민영 주차장. 약관상 저장하지 않고 화면에만 쓴다 */
  lots: NearbyLot[];
  /** 지도 이벤트를 받아 상태를 갱신한다 */
  handleMapEvent: (event: MapEvent) => void;
};

/**
 * 지도에서 올라온 주차장 카테고리(PK6) 검색 결과를 들고 있는다.
 * @param center 목적지 좌표. 거리 계산 기준
 * @param distanceOf 좌표 사이 거리를 재는 함수
 * @returns 민영 주차장 목록과 이벤트 처리기
 */
export const useKakaoNearby = (
  center: { lat: number; lng: number },
  distanceOf: (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => number,
): KakaoNearbyState => {
  const [lots, setLots] = useState<NearbyLot[]>([]);
  const { lat, lng } = center;

  const handleMapEvent = useCallback(
    (event: MapEvent): void => {
      if (event.type === 'nearby') {
        setLots(event.places.map((place) => toLot(place, distanceOf({ lat, lng }, place))));
      }
    },
    [lat, lng, distanceOf],
  );

  return { lots, handleMapEvent };
};
