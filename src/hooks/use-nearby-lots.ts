import { useEffect, useState } from 'react';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/env';
import { MAX_CANDIDATES } from '@/constants/parking';
import type { NearbyLot } from '@/types/parking';
import { radiusMetersFromWalkMinutes } from '@/utils/distance';

export type NearbyLotsQuery = {
  lat: number;
  lng: number;
  /** 반경 프리셋(도보 분) */
  walkMinutes: number;
  freeOnly: boolean;
};

export type NearbyLotsState = {
  lots: NearbyLot[];
  isLoading: boolean;
  /** 실패 사유. 빈 문자열이면 정상 */
  error: string;
};

type FetchResult = { key: string; lots: NearbyLot[]; error: string };

/**
 * 목적지 주변 주차장을 거리순으로 받아 온다.
 *
 * supabase-js를 붙이지 않고 REST로 직접 부른다. 호출이 이 하나뿐이라
 * 클라이언트 라이브러리를 얹으면 번들만 무거워진다.
 * @param query 목적지 좌표와 반경, 무료 여부
 * @returns 후보 목록과 로딩·오류 상태
 */
export const useNearbyLots = ({
  lat,
  lng,
  walkMinutes,
  freeOnly,
}: NearbyLotsQuery): NearbyLotsState => {
  // 조건을 키로 들고 있으면 로딩 여부를 따로 저장하지 않아도 된다.
  // 응답의 키가 현재 조건과 다르면 아직 안 온 것이다
  const key = `${lat},${lng},${walkMinutes},${freeOnly}`;
  const [result, setResult] = useState<FetchResult>({ key: '', lots: [], error: '' });

  const canQuery = SUPABASE_URL !== '' && Number.isFinite(lat) && Number.isFinite(lng);

  useEffect(() => {
    if (!canQuery) {
      return;
    }

    // 화면을 떠난 뒤 도착한 응답으로 상태를 건드리지 않는다
    let isActive = true;

    fetch(`${SUPABASE_URL}/rest/v1/rpc/lots_within`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        center_lat: lat,
        center_lng: lng,
        radius_m: radiusMetersFromWalkMinutes(walkMinutes),
        free_only: freeOnly,
        max_rows: MAX_CANDIDATES,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return (await response.json()) as NearbyLot[];
      })
      .then((lots) => {
        if (isActive) {
          setResult({ key, lots, error: '' });
        }
      })
      .catch(() => {
        if (isActive) {
          setResult({ key, lots: [], error: '주차장 정보를 불러오지 못했습니다' });
        }
      });

    return (): void => {
      isActive = false;
    };
  }, [canQuery, key, lat, lng, walkMinutes, freeOnly]);

  if (!canQuery) {
    return { lots: [], isLoading: false, error: '주차장 정보를 불러올 수 없습니다' };
  }

  const isCurrent = result.key === key;
  return {
    lots: isCurrent ? result.lots : [],
    isLoading: !isCurrent,
    error: isCurrent ? result.error : '',
  };
};
