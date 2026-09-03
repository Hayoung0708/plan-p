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
 * 웹에서의 지도. react-native-webview에는 웹 구현이 없어 같은 HTML을 iframe으로 띄운다.
 *
 * srcDoc이 아니라 /kakao-map 라우트를 가리킨다. srcDoc은 문서 주소가 about:srcdoc이라
 * 카카오 SDK가 보내는 KA 헤더의 origin이 about://으로 나가 장소 검색이 401로 막힌다.
 * @param props 검색어와 이벤트 처리
 * @returns 지도 뷰
 */
export const KakaoMap = ({ keyword, onEvent }: KakaoMapProps): JSX.Element => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  // 지도가 뜨기 전에 보낸 명령은 사라진다. ready를 받은 뒤에 다시 보낸다
  const [isReady, setIsReady] = useState(false);

  const handleWindowMessage = useCallback(
    (event: MessageEvent): void => {
      if (typeof event.data !== 'string') {
        return;
      }
      const parsed = parseMapEvent(event.data);
      if (parsed === null) {
        return;
      }
      if (parsed.type === 'ready') {
        setIsReady(true);
      }
      onEvent(parsed);
    },
    [onEvent],
  );

  useEffect(() => {
    window.addEventListener('message', handleWindowMessage);
    return (): void => window.removeEventListener('message', handleWindowMessage);
  }, [handleWindowMessage]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'search', keyword }), '*');
  }, [isReady, keyword]);

  if (KAKAO_JS_KEY === '') {
    return (
      <View style={styles.guideBox}>
        <Text style={styles.guide}>
          카카오 JavaScript 키가 없습니다.{'\n'}.env에 EXPO_PUBLIC_KAKAO_JS_KEY를 넣어주세요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <iframe ref={frameRef} src="/kakao-map" style={IFRAME_STYLE} title="카카오맵" />
    </View>
  );
};
