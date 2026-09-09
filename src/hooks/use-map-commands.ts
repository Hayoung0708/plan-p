import { useEffect } from 'react';

import type { MapPin } from '@/utils/kakao-map-html';

export type MapCommandInput = {
  keyword: string;
  pins?: MapPin[];
  path?: { lat: number; lng: number }[];
  activePath?: { lat: number; lng: number }[];
  nearby?: { lat: number; lng: number; radius: number };
  myLocation?: { lat: number; lng: number } | null;
};

/**
 * 지도에 내려보낼 명령들을 한곳에서 관리한다.
 * 웹(iframe)과 네이티브(웹뷰)가 전송 방법만 다르고 순서와 조건은 같다.
 * @param send 명령 하나를 실제로 내려보내는 함수
 * @param input 지도에 반영할 값들
 */
export const useMapCommands = (
  send: (command: object) => void,
  { keyword, pins, path, activePath, nearby, myLocation }: MapCommandInput,
): void => {
  useEffect(() => {
    send({ type: 'search', keyword });
  }, [send, keyword]);

  useEffect(() => {
    if (pins !== undefined) {
      send({ type: 'pins', pins, path, activePath });
    }
  }, [send, pins, path, activePath]);

  useEffect(() => {
    if (nearby !== undefined) {
      send({ type: 'nearby', ...nearby });
    }
  }, [send, nearby]);

  useEffect(() => {
    if (myLocation !== null && myLocation !== undefined) {
      send({ type: 'locate', ...myLocation });
    }
  }, [send, myLocation]);
};
