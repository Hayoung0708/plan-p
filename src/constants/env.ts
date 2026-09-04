/**
 * 카카오 JavaScript 앱 키. 클라이언트에 노출되는 값이라 EXPO_PUBLIC_ 접두사를 쓴다.
 * 저장·과금이 걸린 REST 키는 여기 두지 않는다(나중에 Supabase Edge Functions 뒤로).
 */
export const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY ?? '';

/**
 * 카카오 개발자 콘솔에 등록한 사이트 도메인.
 * 웹뷰는 about:blank로 뜨면 도메인 검사에 걸려 지도가 안 나온다. baseUrl로 이 값을 준다.
 */
export const KAKAO_SITE_DOMAIN =
  process.env.EXPO_PUBLIC_KAKAO_SITE_DOMAIN ?? 'http://localhost:8081';

/** Supabase 프로젝트 URL. 주차장 원천 DB 조회에 쓴다 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

/** 공개 키. RLS로 읽기만 열려 있어 노출돼도 안전하다 */
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** 도로명주소 검색 API 승인키. 주소를 법정동코드와 본번·부번으로 바꾼다 */
export const JUSO_KEY = process.env.EXPO_PUBLIC_JUSO_KEY ?? '';

/**
 * 공공데이터포털 서비스키. 건축물대장 조회에 쓴다.
 * 배포 전에는 Edge Functions 프록시 뒤로 옮겨야 한다
 */
export const DATA_GO_KR_KEY = process.env.EXPO_PUBLIC_DATA_GO_KR_KEY ?? '';
