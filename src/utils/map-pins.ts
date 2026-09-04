import type { NearbyLot } from '@/types/parking';
import type { MapPin } from '@/utils/kakao-map-html';

/**
 * 후보 목록을 지도 핀으로 바꾼다.
 * 전체는 작은 점으로 찍고 지금 안내 중인 곳만 강조한다.
 * 뒤에 뭐가 남았는지 보이지 않으면 앱을 안 믿고 직접 검색하게 된다.
 * @param lots 후보 목록
 * @param currentIndex 현재 안내 중인 후보의 순서
 * @param previewCount 순번을 붙일 후보 수. 0이면 순번 없이 점만 찍는다
 * @returns 지도에 찍을 핀 목록
 */
export const toPins = (lots: NearbyLot[], currentIndex: number, previewCount = 0): MapPin[] =>
  lots.map((lot, order) => {
    const previewOrder = order - currentIndex;
    const isPreview = previewOrder > 0 && previewOrder < previewCount;
    return {
      id: lot.code,
      lat: lot.lat,
      lng: lot.lng,
      primary: order === currentIndex,
      // 현재 다음 후보부터 순번을 붙인다. 1번은 지금 안내 중인 곳이라 마커로 따로 표시된다
      ...(isPreview ? { label: String(previewOrder + 1) } : {}),
    };
  });

/**
 * 경로 미리보기 선에 쓸 좌표를 만든다.
 * 현재 위치에서 앞쪽 후보 몇 곳까지만 잇는다. 전부 이으면 선이 엉켜 순서를 못 읽는다.
 * @param lots 후보 목록
 * @param currentIndex 현재 안내 중인 후보의 순서
 * @param origin 현재 위치. 없으면 현재 후보에서 시작한다
 * @param previewCount 미리보기에 넣을 후보 수
 * @returns 이어 그릴 좌표들
 */
export const toRoutePath = (
  lots: NearbyLot[],
  currentIndex: number,
  origin: { lat: number; lng: number } | null,
  previewCount: number,
): { lat: number; lng: number }[] => {
  const stops = lots
    .slice(currentIndex, currentIndex + previewCount)
    .map(({ lat, lng }) => ({ lat, lng }));
  return origin === null ? stops : [origin, ...stops];
};
