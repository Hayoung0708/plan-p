import { useCurrentLocation } from '@/hooks/use-current-location';
import { useKakaoNearby } from '@/hooks/use-kakao-nearby';
import { useNearbyLots } from '@/hooks/use-nearby-lots';
import type { NearbyLot } from '@/types/parking';
import { radiusMetersFromWalkMinutes } from '@/utils/distance';
import type { MapEvent } from '@/utils/kakao-map-html';
import { distanceMeters, mergeLots } from '@/utils/merge-lots';
import { buildRoute } from '@/utils/queue';

/** 라우트 파라미터 그대로. 문자열이고 빠질 수 있다 */
export type SessionQueryInput = {
  lat?: string;
  lng?: string;
  walkMinutes?: string;
  freeOnly?: string;
  /** 목적지 이름. 건물 주차장 후보의 이름에 쓴다 */
  name?: string;
  /** 목적지 건물의 주차면 수. 0이면 건물 주차장이 없다 */
  buildingSpaces?: string;
};

export type SessionQuery = {
  /** 이동 순서대로 정렬된 후보 */
  candidates: NearbyLot[];
  /** 지도에 민영 주차장 조회를 시킬 중심과 반경 */
  nearby: { lat: number; lng: number; radius: number };
  /** 현재 위치. 권한이 없으면 null */
  location: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string;
  /** 지도가 올려보낸 민영 주차장 결과를 받는다 */
  handleMapEvent: (event: MapEvent) => void;
};

/**
 * 목적지 건물 자체를 후보 모양으로 만든다. 요금은 건축물대장에 없어 모른다고 둔다.
 * @param name 목적지 이름
 * @param center 목적지 좌표
 * @param totalSpaces 주차면 수
 * @returns 후보 하나
 */
const buildingLot = (
  name: string,
  center: { lat: number; lng: number },
  totalSpaces: number,
): NearbyLot => ({
  code: 'building',
  name: name + ' 건물 주차장',
  address: '',
  total_spaces: totalSpaces,
  base_fee: null,
  base_minutes: null,
  charge_type: null,
  lot_type: '부설',
  ...center,
  distance_m: 0,
});

/**
 * 안내 화면이 쓰는 후보 데이터를 한곳에서 만든다.
 *
 * 공공(DB) + 민영(카카오, 화면에서만) 을 합치고 현재 위치에서 가까운 순으로 세운다.
 * 무료만 보기일 때는 요금을 모르는 민영을 섞으면 조건이 깨져 공공만 쓴다.
 * 목적지 건물에 주차장이 있으면 어디보다 먼저 간다. 거기 대면 걸을 일이 없다.
 * @param input 라우트 파라미터 그대로
 * @returns 후보와 조회 상태
 */
export const useSessionQuery = ({
  lat = '',
  lng = '',
  walkMinutes = '10',
  freeOnly = 'false',
  name = '목적지',
  buildingSpaces = '0',
}: SessionQueryInput): SessionQuery => {
  const center = { lat: Number(lat), lng: Number(lng) };
  const radius = radiusMetersFromWalkMinutes(Number(walkMinutes));
  const isFreeOnly = freeOnly === 'true';

  const { lots, isLoading, error } = useNearbyLots({
    ...center,
    walkMinutes: Number(walkMinutes),
    freeOnly: isFreeOnly,
  });
  const { lots: kakaoLots, handleMapEvent } = useKakaoNearby(center, distanceMeters);
  // 지금 있는 곳에서 가까운 순으로 세워야 되돌아가는 동선이 안 생긴다. 권한이 없으면 목적지 기준
  const { location } = useCurrentLocation();
  const route = buildRoute(isFreeOnly ? lots : mergeLots(lots, kakaoLots), location ?? center);
  const candidates =
    Number(buildingSpaces) > 0
      ? [buildingLot(name, center, Number(buildingSpaces)), ...route]
      : route;

  return { candidates, nearby: { ...center, radius }, location, isLoading, error, handleMapEvent };
};
