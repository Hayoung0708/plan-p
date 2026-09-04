/** 카카오모빌리티 길찾기 응답에서 쓰는 부분만 추린 모양 */
export type DirectionsResponse = {
  routes: {
    result_code: number;
    summary?: { distance: number; duration: number };
    sections?: { roads?: { vertexes: number[] }[] }[];
  }[];
};

export type DrivingRoute = {
  /** 도로를 따라가는 좌표열 전체 */
  path: { lat: number; lng: number }[];
  /** 구간별 좌표열. 첫 구간이 '지금 가야 할 길'이라 따로 강조한다 */
  sections: { lat: number; lng: number }[][];
  /** 총 소요 시간(분) */
  durationMinutes: number;
  /** 총 거리(m) */
  distanceM: number;
};

/**
 * 길찾기 응답을 지도에 그릴 경로로 바꾼다.
 *
 * vertexes는 [경도, 위도, 경도, 위도, …]로 평평하게 온다. 순서를 헷갈리면 지도 밖으로 선이 날아간다.
 * @param body 길찾기 응답
 * @returns 도로 경로. 실패했으면 null
 */
export const toDrivingRoute = (body: DirectionsResponse): DrivingRoute | null => {
  const route = body.routes?.[0];
  if (route === undefined || route.result_code !== 0) {
    return null;
  }

  const sections = (route.sections ?? []).map((section) => {
    const points: { lat: number; lng: number }[] = [];
    section.roads?.forEach(({ vertexes }) => {
      for (let i = 0; i + 1 < vertexes.length; i += 2) {
        points.push({ lng: vertexes[i], lat: vertexes[i + 1] });
      }
    });
    return points;
  });
  const path = sections.flat();

  if (path.length === 0) {
    return null;
  }
  return {
    path,
    sections,
    durationMinutes: Math.max(1, Math.round((route.summary?.duration ?? 0) / 60)),
    distanceM: route.summary?.distance ?? 0,
  };
};
