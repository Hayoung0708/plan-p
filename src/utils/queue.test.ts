import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildRoute } from './queue.ts';
import type { NearbyLot } from '../types/parking.ts';

/**
 * 테스트용 후보를 만든다.
 * @param code 식별자
 * @param lat 위도
 * @param lng 경도
 * @returns 후보
 */
const lot = (code: string, lat: number, lng: number): NearbyLot => ({
  code,
  name: code,
  address: '',
  total_spaces: null,
  base_fee: null,
  base_minutes: null,
  charge_type: null,
  lot_type: null,
  lat,
  lng,
  distance_m: 0,
});

test('목적지에서 가장 가까운 곳이 1순위가 된다', () => {
  const destination = { lat: 37.5, lng: 127.0 };
  const route = buildRoute([lot('far', 37.51, 127.0), lot('near', 37.501, 127.0)], destination);
  assert.equal(route[0].code, 'near');
});

test('2순위부터는 직전 후보에서 가까운 곳을 고른다', () => {
  // 목적지 남쪽에 a, 그 남쪽에 b, 목적지 북쪽에 c.
  // 목적지 기준 거리순이면 a-c-b가 되어 남쪽으로 갔다가 북쪽으로 되돌아온다
  const destination = { lat: 37.5, lng: 127.0 };
  const lots = [lot('a', 37.499, 127.0), lot('c', 37.5015, 127.0), lot('b', 37.4975, 127.0)];
  const route = buildRoute(lots, destination);
  assert.deepEqual(
    route.map(({ code }) => code),
    ['a', 'b', 'c'],
  );
});

test('후보가 없으면 빈 경로다', () => {
  assert.deepEqual(buildRoute([], { lat: 37.5, lng: 127.0 }), []);
});
