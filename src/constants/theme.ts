/**
 * 플랜P 디자인 토큰.
 *
 * 운전 중 흘긋 보는 화면이라 대비를 높게, 여백을 넉넉히 잡는다.
 * 색·글자·간격·모서리·그림자는 여기서만 정의하고 화면은 이름으로만 쓴다.
 */

export const Colors = {
  // 브랜드
  brand: '#2F6BFF',
  brandStrong: '#1F4FD6',
  brandSoft: '#EAF0FF',
  onBrand: '#FFFFFF',

  // 바탕과 면
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F7',
  border: '#E4E7EE',

  // 글자
  text: '#0F172A',
  textSecondary: '#475569',
  muted: '#8A94A6',

  // 의미
  success: '#16A34A',
  successSoft: '#ECFDF3',
  warn: '#D97706',
  warnSoft: '#FFF7E6',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',

  // 지도 위 오버레이. 지도가 비쳐야 넓게 느껴진다
  overlay: 'rgba(255,255,255,0.92)',
  scrim: 'rgba(15,23,42,0.35)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/**
 * 글꼴 이름. 네이티브는 굵기마다 파일이 따로라 fontWeight가 아니라 family 이름으로 고른다.
 * 파일은 assets/fonts에, 등록은 app/_layout.tsx에서 한다
 */
export const Fonts = {
  medium: 'Pretendard-Medium',
  bold: 'Pretendard-Bold',
  extraBold: 'Pretendard-ExtraBold',
  // 제목용. 본문(Pretendard)보다 둥글고 부드러워 목적지 이름·주차장명 같은 큰 글자에만 쓴다
  displayBold: 'SUIT-Bold',
  displayExtraBold: 'SUIT-ExtraBold',
} as const;

/** 글자 크기·굵기·행간 묶음. 화면은 이 이름으로만 글자를 쓴다 */
export const Typography = {
  display: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  heading: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
} as const;

/**
 * 그림자. RN 0.76+의 boxShadow는 웹·안드로이드·iOS 모두 같은 문법이라
 * 예전 방식(shadowColor 계열과 elevation) 두 벌을 관리할 필요가 없다.
 */
export const Shadow = {
  card: '0 4px 16px rgba(15, 23, 42, 0.08)',
  float: '0 8px 24px rgba(15, 23, 42, 0.14)',
} as const;

/** 애니메이션 길이(ms). 상태가 바뀔 때 툭 튀지 않고 이 시간 동안 넘어간다 */
export const Motion = { fast: 150, base: 250, count: 600 } as const;

/** 주행 중 엄지로 눌러야 해서 주요 버튼은 이 높이 아래로 내리지 않는다 */
export const DriveButtonHeight = 64;

/** 터치 타깃 최소 크기. 이보다 작으면 운전 중엔 못 누른다 */
export const TouchTarget = 44;
