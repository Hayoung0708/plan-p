/** 실시간 잔여면수 상태. 공영 일부만 실시간이라 나머지는 추정값으로 표시한다 */
export type Availability =
  | { kind: 'live'; freeSpaces: number; updatedMinutesAgo: number }
  | { kind: 'estimated'; level: 'low' | 'medium' | 'high' }
  | { kind: 'unknown' };

/** 후보 큐에 들어가는 주차장 하나 */
export type ParkingLot = {
  id: string;
  name: string;
  /** 목적지까지 도보 분. 직선거리 보정값이라 실측과 다를 수 있다 */
  walkMinutes: number;
  /** 현재 위치 기준 차량 이동 분. 전환할 때마다 다시 계산된다 */
  driveMinutes: number;
  /** 시간당 요금(원). 민영은 요금 데이터가 없어 null */
  hourlyFee: number | null;
  availability: Availability;
  /** 공공데이터 출처면 true. 민영은 카카오 조회분이라 저장하지 않는다 */
  isPublic: boolean;
};

/** 검색으로 고른 목적지 */
export type Destination = {
  id: string;
  name: string;
  address: string;
  /** 건물 자체 주차장. 없으면 null이고 화면에 '주차 불가'로 확실히 알린다 */
  ownParking: { hourlyFee: number | null } | null;
};
