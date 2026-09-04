import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { KakaoMapProps } from '@/components/kakao-map';
import { KAKAO_JS_KEY } from '@/constants/env';
import { Colors, Spacing } from '@/constants/theme';
import { parseMapEvent } from '@/utils/kakao-map-html';

const styles = StyleSheet.create({
  fill: { flex: 1 },
  guide: { color: Colors.muted, fontSize: 14, padding: Spacing.xl, textAlign: 'center' },
  guideBox: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
});

/**
 * iframe에 그대로 넘길 스타일.
 * height:100%로 두면 부모 높이가 확정되기 전에 기본 높이로 잡혀 화면이 넘친다.
 * 절대 배치로 부모를 그대로 채운다.
 */
const IFRAME_STYLE = {
  border: 'none',
  bottom: 0,
  height: '100%',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  width: '100%',
} as const;

/**
 * 키가 없을 때 지도 자리에 띄우는 안내. 빈 화면이면 원인을 알 수 없다.
 * @returns 안내 뷰
 */
const MissingKeyNotice = (): JSX.Element => (
  <View style={styles.guideBox}>
    <Text style={styles.guide}>
      카카오 JavaScript 키가 없습니다. .env에 EXPO_PUBLIC_KAKAO_JS_KEY를 넣어주세요.
    </Text>
  </View>
);

/**
 * 웹에서의 지도. react-native-webview에는 웹 구현이 없어 같은 HTML을 iframe으로 띄운다.
 *
 * srcDoc이 아니라 /kakao-map 라우트를 가리킨다. srcDoc은 문서 주소가 about:srcdoc이라
 * 카카오 SDK가 보내는 KA 헤더의 origin이 about://으로 나가 장소 검색이 401로 막힌다.
 * @param props 검색어와 이벤트 처리
 * @returns 지도 뷰
 */
export const KakaoMap = ({
  keyword,
  onEvent,
  nearby,
  pins,
  path,
  activePath,
}: KakaoMapProps): JSX.Element => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  // 지도가 뜨기 전에 보낸 명령은 사라진다. ready를 받은 뒤에 다시 보낸다
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    /**
     * 아이프레임이 올려보낸 메시지를 이벤트로 바꿔 넘긴다.
     * @param event 창 메시지 이벤트
     */
    const handleMessage = (event: MessageEvent): void => {
      const parsed = typeof event.data === 'string' ? parseMapEvent(event.data) : null;
      if (parsed === null) {
        return;
      }
      if (parsed.type === 'ready') {
        setIsReady(true);
      }
      onEvent(parsed);
    };
    window.addEventListener('message', handleMessage);
    return (): void => window.removeEventListener('message', handleMessage);
  }, [onEvent]);

  // 명령은 지도가 준비된 뒤에만 내려보낸다. 그전에 보낸 건 사라진다
  const send = useCallback(
    (command: object): void => {
      if (!isReady) {
        return;
      }
      frameRef.current?.contentWindow?.postMessage(JSON.stringify(command), '*');
    },
    [isReady],
  );

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

  if (KAKAO_JS_KEY === '') {
    return <MissingKeyNotice />;
  }

  return (
    <View style={styles.fill}>
      <iframe ref={frameRef} src="/kakao-map" style={IFRAME_STYLE} title="카카오맵" />
    </View>
  );
};
