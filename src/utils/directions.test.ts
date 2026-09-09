import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toDrivingRoute } from './directions.ts';

test('vertexes를 경도·위도 순서로 풀어 좌표를 만든다', () => {
  const route = toDrivingRoute({
    routes: [
      {
        result_code: 0,
        summary: { distance: 1856, duration: 600 },
        sections: [{ roads: [{ vertexes: [126.977, 37.5725, 126.9772, 37.5716] }] }],
      },
    ],
  });
  assert.deepEqual(route?.path, [
    { lng: 126.977, lat: 37.5725 },
    { lng: 126.9772, lat: 37.5716 },
  ]);
  assert.equal(route?.durationMinutes, 10);
});

test('길찾기 실패면 null이다', () => {
  assert.equal(toDrivingRoute({ routes: [{ result_code: 104 }] }), null);
});

test('좌표가 하나도 없으면 null이다', () => {
  assert.equal(toDrivingRoute({ routes: [{ result_code: 0, sections: [] }] }), null);
});
