/** 반경 검색으로 받아온 주차장 하나. Supabase lots_within RPC의 반환 모양 */
export type NearbyLot = {
  code: string;
  name: string;
  address: string;
  /** 주차면 수. 원본에 없으면 null */
  total_spaces: number | null;
  /** 기본요금(원) / 기본시간(분). 무료거나 미상이면 null */
  base_fee: number | null;
  base_minutes: number | null;
  /** 유료 / 무료 / 혼합 */
  charge_type: string | null;
  /** 노외 / 노상 / 부설 */
  lot_type: string | null;
  lat: number;
  lng: number;
  /** 목적지까지 직선거리(m) */
  distance_m: number;
};
