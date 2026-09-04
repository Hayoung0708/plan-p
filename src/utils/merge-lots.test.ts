import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isSameLot, mergeLots, normalizeName } from './merge-lots.ts';
import type { NearbyLot } from '../types/parking.ts';

/**
 * 테스트용 주차장 하나를 만든다.
 * @param overrides 바꿀 필드
 * @returns 주차장
 */
const lot = (overrides: Partial<NearbyLot>): NearbyLot => ({
  code: 'x',
  name: '시청역 공영주차장',
  address: '서울 중구',
  total_spaces: 50,
  base_fee: 500,
  base_minutes: 10,
  charge_type: '유료',
  lot_type: '노외',
  lat: 37.5666,
  lng: 126.9784,
  distance_m: 100,
  ...overrides,
});

test('이름 정규화는 공백과 주차장 접미어를 뗀다', () => {
  assert.equal(normalizeName('시청역 공영 주차장'), '시청역');
});

test('가깝고 이름이 겹치면 같은 주차장으로 본다', () => {
  const publicLot = lot({});
  const kakaoLot = lot({ code: 'kakao:1', name: '시청역주차장', lat: 37.5669 });
  assert.equal(isSameLot(publicLot, kakaoLot), true);
});

test('이름이 겹쳐도 멀면 다른 주차장이다', () => {
  const publicLot = lot({});
  const kakaoLot = lot({ code: 'kakao:1', name: '시청역주차장', lat: 37.58 });
  assert.equal(isSameLot(publicLot, kakaoLot), false);
});

test('주차면이 많으면 좌표가 더 벌어져도 같은 곳으로 본다', () => {
  const big = lot({ total_spaces: 300 });
  const kakaoLot = lot({ code: 'kakao:1', name: '시청역주차장', lat: 37.5675 });
  assert.equal(isSameLot(big, kakaoLot), true);
  assert.equal(isSameLot(lot({ total_spaces: 10 }), kakaoLot), false);
});

test('병합은 중복을 빼고 거리순으로 정렬한다', () => {
  const publicLots = [lot({ code: 'p1', distance_m: 300 })];
  const kakaoLots = [
    lot({ code: 'kakao:dup', name: '시청역주차장', lat: 37.5667, distance_m: 290 }),
    lot({ code: 'kakao:new', name: '무교동민영', lat: 37.57, lng: 126.98, distance_m: 120 }),
  ];
  const merged = mergeLots(publicLots, kakaoLots);
  assert.deepEqual(
    merged.map(({ code }) => code),
    ['kakao:new', 'p1'],
  );
});
