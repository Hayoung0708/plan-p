import type { NearbyLot } from '@/types/parking';

/** 같은 주차장으로 볼 기본 거리(m) */
const BASE_MATCH_METERS = 50;
/** 주차면 1면당 늘려 주는 거리(m). 대형은 공공(부지 중심)과 카카오(입구) 좌표가 벌어진다 */
const METERS_PER_SPACE = 0.3;
/** 아무리 큰 주차장이어도 이 거리를 넘으면 다른 주차장으로 본다 */
const MAX_MATCH_METERS = 150;

/** 지구 반지름(m) */
const EARTH_RADIUS_M = 6371000;

/**
 * 두 좌표 사이 직선거리.
 * @param a 좌표 하나
 * @param b 다른 좌표
 * @returns 미터
 */
export const distanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number => {
  /**
   * 도 단위 각도를 라디안으로 바꾼다.
   * @param degree 도 단위 각도
   * @returns 라디안
   */
  const toRad = (degree: number): number => (degree * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

/**
 * 이름을 비교용으로 다듬는다. 공백과 '공영/노상/노외/주차장' 같은 접미어를 뗀다.
 * @param name 주차장 이름
 * @returns 정규화된 이름
 */
export const normalizeName = (name: string): string =>
  name
    .replace(/\s+/g, '')
    .replace(/(공영|시영|구영|노상|노외|부설|주차장|주차타워)/g, '')
    .toLowerCase();

/**
 * 두 주차장이 같은 곳인지 본다.
 * 좌표가 가깝고 이름이 서로를 포함하면 같은 곳으로 친다.
 * @param a 공공 주차장
 * @param b 카카오에서 온 주차장
 * @returns 같은 곳이면 true
 */
export const isSameLot = (a: NearbyLot, b: NearbyLot): boolean => {
  const allowed = Math.min(
    BASE_MATCH_METERS + (a.total_spaces ?? 0) * METERS_PER_SPACE,
    MAX_MATCH_METERS,
  );
  if (distanceMeters(a, b) > allowed) {
    return false;
  }
  const left = normalizeName(a.name);
  const right = normalizeName(b.name);
  if (left === '' || right === '') {
    return false;
  }
  return left.includes(right) || right.includes(left);
};

/**
 * 공공 주차장과 카카오 주차장을 화면용으로 합친다.
 *
 * 겹치면 항상 공공 쪽을 남긴다. 요금 정보가 거기에만 있기 때문이다.
 * 카카오 결과는 저장할 수 없으므로 이 병합은 화면에서만 일어난다.
 * @param publicLots 공공데이터에서 온 주차장
 * @param kakaoLots 카카오 조회로 온 민영 주차장
 * @returns 거리순으로 정렬된 후보 목록
 */
export const mergeLots = (publicLots: NearbyLot[], kakaoLots: NearbyLot[]): NearbyLot[] => {
  const extras = kakaoLots.filter(
    (kakaoLot) => !publicLots.some((publicLot) => isSameLot(publicLot, kakaoLot)),
  );
  return [...publicLots, ...extras].sort((a, b) => a.distance_m - b.distance_m);
};
