import type { Destination, ParkingLot } from '@/types/parking';

/** 검색 화면 최근 목록. 실제로는 로컬 저장소에서 읽는다 */
export const RECENT_DESTINATIONS: Destination[] = [
  {
    id: 'dest-1',
    name: '롯데백화점 본점',
    address: '서울 중구 남대문로 81',
    ownParking: null,
  },
  {
    id: 'dest-2',
    name: '강남역',
    address: '서울 강남구 강남대로 396',
    ownParking: { hourlyFee: 3000 },
  },
];

/** 검색어를 입력했을 때 뜨는 결과. 카카오 로컬 키워드 검색 자리 */
export const SEARCH_RESULTS: Destination[] = [
  ...RECENT_DESTINATIONS,
  {
    id: 'dest-3',
    name: '서울시청',
    address: '서울 중구 세종대로 110',
    ownParking: { hourlyFee: 2000 },
  },
];

/** 후보 큐 목데이터. 실제로는 반경 검색 결과를 점수순으로 정렬해 만든다 */
export const CANDIDATE_QUEUE: ParkingLot[] = [
  {
    id: 'lot-1',
    name: '시청역 공영주차장',
    walkMinutes: 4,
    driveMinutes: 3,
    hourlyFee: 5000,
    availability: { kind: 'live', freeSpaces: 12, updatedMinutesAgo: 3 },
    isPublic: true,
  },
  {
    id: 'lot-2',
    name: '무교동 노외주차장',
    walkMinutes: 6,
    driveMinutes: 4,
    hourlyFee: 4000,
    availability: { kind: 'estimated', level: 'medium' },
    isPublic: true,
  },
  {
    id: 'lot-3',
    name: '을지로1가 민영주차장',
    walkMinutes: 7,
    driveMinutes: 5,
    hourlyFee: null,
    availability: { kind: 'unknown' },
    isPublic: false,
  },
  {
    id: 'lot-4',
    name: '서소문 공영주차장',
    walkMinutes: 9,
    driveMinutes: 6,
    hourlyFee: 3000,
    availability: { kind: 'live', freeSpaces: 40, updatedMinutesAgo: 5 },
    isPublic: true,
  },
  {
    id: 'lot-5',
    name: '정동길 노상주차장',
    walkMinutes: 11,
    driveMinutes: 8,
    hourlyFee: 2000,
    availability: { kind: 'estimated', level: 'low' },
    isPublic: true,
  },
];

/** 반경 프리셋(도보 분). 사용자가 만지는 값은 이것과 무료 토글 둘뿐 */
export const RADIUS_PRESETS = [5, 10, 15] as const;

/** 후보가 이 수 이하로 줄면 반경 넓히기를 먼저 제안한다 */
export const LOW_CANDIDATE_THRESHOLD = 3;
