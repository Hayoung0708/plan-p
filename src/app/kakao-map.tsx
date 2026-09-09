import type { JSX } from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { KAKAO_JS_KEY } from '@/constants/env';
import { buildKakaoMapHtml } from '@/utils/kakao-map-html';

/**
 * 웹에서 지도 아이프레임이 가리키는 라우트.
 *
 * srcDoc으로 띄우면 문서 주소가 about:srcdoc이 되고, 카카오 SDK가 보내는 KA 헤더의
 * origin이 about://으로 나가 장소 검색이 401로 막힌다. 등록된 도메인의 실제 URL에서
 * 문서를 열어야 해서 라우트 하나를 두고 그 안에서 지도 HTML을 쓴다.
 * @returns 화면 없음. 문서 전체를 지도 HTML로 교체한다
 */
const KakaoMapFrame = (): JSX.Element | null => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    document.open();
    document.write(buildKakaoMapHtml(KAKAO_JS_KEY));
    document.close();
  }, []);

  return null;
};

export default KakaoMapFrame;
