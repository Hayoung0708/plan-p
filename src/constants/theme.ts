/** 운전 중 흘긋 보는 화면이라 대비를 높게 잡는다 */
export const Colors = {
  brand: '#1D4ED8',
  brandSoft: '#EEF2FF',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  border: '#E5E7EB',
  text: '#111827',
  muted: '#6B7280',
  warn: '#B45309',
  danger: '#DC2626',
  onBrand: '#FFFFFF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const Radius = {
  md: 10,
  lg: 16,
} as const;

/** 주행 중 엄지로 눌러야 해서 주요 버튼은 이 높이 아래로 내리지 않는다 */
export const DriveButtonHeight = 64;
