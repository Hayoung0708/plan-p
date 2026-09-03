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
