/** 도보 속도 4km/h = 분당 67m */
const WALK_METERS_PER_MINUTE = 67;
/** 직선거리를 실제 보행거리로 보정하는 계수. 길이 직선으로 나 있지 않다 */
const WALK_DETOUR_RATIO = 1.3;

/**
 * 직선거리를 도보 분으로 바꾼다.
 * 길찾기 API를 후보 전원에게 때리면 비용이 커서 도보는 계산으로 때운다.
 * @param meters 목적지까지 직선거리(m)
 * @returns 올림한 도보 분. 최소 1분
 */
export const walkMinutesFromMeters = (meters: number): number =>
  Math.max(1, Math.ceil((meters * WALK_DETOUR_RATIO) / WALK_METERS_PER_MINUTE));

/**
 * 도보 분 프리셋을 검색 반경(m)으로 바꾼다.
 * @param minutes 도보 분
 * @returns 반경(m)
 */
export const radiusMetersFromWalkMinutes = (minutes: number): number =>
  Math.round((minutes * WALK_METERS_PER_MINUTE) / WALK_DETOUR_RATIO);
