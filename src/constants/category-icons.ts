import {
  Baby,
  BedDouble,
  Building2,
  Camera,
  CircleParking,
  Coffee,
  Fuel,
  GraduationCap,
  Handshake,
  Landmark,
  MapPin,
  Pill,
  School,
  ShoppingCart,
  Stethoscope,
  Store,
  Theater,
  TrainFront,
  Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 카카오 장소 카테고리 그룹 코드별 아이콘.
 * 이름(category_group_name)이 아니라 코드를 쓰는 이유는 이름 표기가 바뀌어도 코드는 그대로라서다.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  AC5: GraduationCap, // 학원
  AD5: BedDouble, // 숙박
  AG2: Handshake, // 중개업소
  AT4: Camera, // 관광명소
  BK9: Landmark, // 은행
  CE7: Coffee, // 카페
  CS2: Store, // 편의점
  CT1: Theater, // 문화시설
  FD6: Utensils, // 음식점
  HP8: Stethoscope, // 병원
  MT1: ShoppingCart, // 대형마트
  OL7: Fuel, // 주유소·충전소
  PK6: CircleParking, // 주차장
  PM9: Pill, // 약국
  PO3: Building2, // 공공기관
  PS3: Baby, // 어린이집·유치원
  SC4: School, // 학교
  SW8: TrainFront, // 지하철역
};

/** 분류가 없거나 모르는 코드일 때 쓰는 아이콘 */
export const DEFAULT_CATEGORY_ICON: LucideIcon = MapPin;
