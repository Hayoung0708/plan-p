import { useEffect, useState } from 'react';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/env';
import type { DirectionsResponse, DrivingRoute } from '@/utils/directions';
import { toDrivingRoute } from '@/utils/directions';

export type Coordinate = { lat: number; lng: number };

export type DrivingRouteState = {
  /** 도로를 따라가는 경로. 아직 없거나 실패면 null */
  route: DrivingRoute | null;
};

/**
 * 현재 위치에서 앞쪽 후보들까지의 실제 도로 경로를 받아 온다.
 *
 * 카카오 REST 키는 도메인 제한이 없어 클라이언트에 두면 유출 시 쿼터가 털린다.
 * 그래서 Supabase Edge Function 프록시를 거친다. 브라우저 CORS도 이걸로 같이 풀린다.
 * @param stops 현재 위치를 포함한 경유 순서. 2곳 미만이면 조회하지 않는다
 * @returns 도로 경로
 */
export const useDrivingRoute = (stops: Coordinate[]): DrivingRouteState => {
  const [route, setRoute] = useState<DrivingRoute | null>(null);
  // 좌표를 키로 만들어 두면 배열이 매 렌더 새로 만들어져도 재조회하지 않는다
  const key = stops.map(({ lat, lng }) => `${lat},${lng}`).join('|');

  useEffect(() => {
    if (stops.length < 2 || SUPABASE_URL === '') {
      return;
    }
    let isActive = true;
    const points = key.split('|').map((pair) => {
      const [lat, lng] = pair.split(',');
      return { x: Number(lng), y: Number(lat) };
    });

    fetch(`${SUPABASE_URL}/functions/v1/directions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: points[0],
        destination: points[points.length - 1],
        waypoints: points.slice(1, -1),
      }),
    })
      .then(async (response) => (await response.json()) as DirectionsResponse)
      .then((body) => {
        if (isActive) {
          setRoute(toDrivingRoute(body));
        }
      })
      // 길찾기가 죽어도 안내는 계속돼야 한다. 직선 경로로 떨어진다
      .catch(() => {
        if (isActive) {
          setRoute(null);
        }
      });

    return (): void => {
      isActive = false;
    };
  }, [key, stops.length]);

  return { route };
};
