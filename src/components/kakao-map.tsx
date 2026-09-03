import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { KAKAO_JS_KEY, KAKAO_SITE_DOMAIN } from '@/constants/env';
import { Colors, Spacing } from '@/constants/theme';
import type { MapEvent } from '@/utils/kakao-map-html';
import { buildKakaoMapHtml, parseMapEvent } from '@/utils/kakao-map-html';

export type KakaoMapProps = {
  /** 확정된 검색어. 바뀔 때만 지도에 검색을 시킨다 */
  keyword: string;
  /** 지도가 올려보낸 이벤트 처리 */
  onEvent: (event: MapEvent) => void;
};

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
 * 카카오맵 JS SDK를 웹뷰에 올린 지도.
 *
 * 네이티브 SDK 대신 웹뷰를 쓰는 이유는 Expo Go에서 바로 돌기 때문이다.
 * 나중에 네이티브로 갈아타도 바꿀 파일은 이 하나다.
 * @param props 검색어와 이벤트 처리
 * @returns 지도 뷰
 */
export const KakaoMap = ({ keyword, onEvent }: KakaoMapProps): JSX.Element => {
  const webViewRef = useRef<WebView>(null);
  // 지도가 뜨기 전에 보낸 명령은 사라진다. ready를 받은 뒤에 다시 보낸다
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const payload = JSON.stringify(JSON.stringify({ type: 'search', keyword }));
    webViewRef.current?.injectJavaScript('window.planpCommand(' + payload + '); true;');
  }, [isReady, keyword]);

  /**
   * 웹뷰 메시지를 이벤트로 바꿔 넘긴다.
   * @param event 웹뷰 메시지 이벤트
   */
  const handleMessage = ({ nativeEvent }: WebViewMessageEvent): void => {
    const parsed = parseMapEvent(nativeEvent.data);
    if (parsed === null) {
      return;
    }
    if (parsed.type === 'ready') {
      setIsReady(true);
    }
    onEvent(parsed);
  };

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
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ baseUrl: KAKAO_SITE_DOMAIN, html: buildKakaoMapHtml(KAKAO_JS_KEY) }}
      style={styles.fill}
      onMessage={handleMessage}
    />
  );
};
