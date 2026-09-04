import type { NearbyLot } from '@/types/parking';
// 같은 폴더 안이라 상대경로로 가져온다. 테스트 러너(node --test)는 @/ 별칭을 못 푼다
import { distanceMeters } from './merge-lots.ts';

/**
 * 후보를 최근접 이웃 순서로 늘어놓는다.
 *
 * 목적지에서 가장 가까운 곳을 1순위로 잡고, 그다음부터는 "직전 후보에서 가장 가까운 곳"을 고른다.
 * 목적지 기준 거리순으로만 세우면 1번에서 2번으로 갈 때 왔던 길을 되돌아가는 동선이 나온다.
 *
 * 전체 순회 경로를 최적화하지는 않는다. 사용자는 첫 성공 지점에서 멈추고 실제 방문은 1~3곳이라,
 * "지금 위치에서 다음 한 곳"만 잘 고르는 그리디로 충분하다.
 * @param lots 후보 목록
 * @param destination 목적지 좌표. 1순위를 고르는 기준
 * @returns 이동 순서대로 정렬된 후보
 */
export const buildRoute = (
  lots: NearbyLot[],
  destination: { lat: number; lng: number },
): NearbyLot[] => {
  const rest = [...lots];
  const route: NearbyLot[] = [];
  let from = destination;

  while (rest.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    rest.forEach((lot, index) => {
      const distance = distanceMeters(from, lot);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    const [next] = rest.splice(bestIndex, 1);
    route.push(next);
    from = next;
  }

  return route;
};
