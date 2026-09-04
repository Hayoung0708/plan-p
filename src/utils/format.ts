import type { NearbyLot } from '@/types/parking';

/**
 * 요금을 화면 문구로 바꾼다.
 * @param lot 주차장 하나
 * @returns '500원/10분' 또는 '무료' 또는 '요금 정보 없음'
 */
export const formatFee = ({ charge_type, base_fee, base_minutes }: NearbyLot): string => {
  if (charge_type === '무료') {
    return '무료';
  }
  if (base_fee === null || base_minutes === null) {
    return '요금 정보 없음';
  }
  return `${base_fee.toLocaleString('ko-KR')}원/${base_minutes}분`;
};

/**
 * 주차면 수를 문구로 바꾼다. 실시간 잔여면수는 아직 연결 전이라 총면수만 보여준다.
 * @param totalSpaces 총 주차면 수
 * @returns '총 77면' 또는 '면수 정보 없음'
 */
export const formatSpaces = (totalSpaces: number | null): string =>
  totalSpaces === null ? '면수 정보 없음' : `총 ${totalSpaces}면`;

/**
 * 남은 후보 수를 문구로 바꾼다. '1/9' 같은 진행률은 쓰지 않는다.
 * 몇 번 실패했는지 세게 만들면 앱을 안 믿게 된다.
 * @param remaining 아직 안 가본 후보 수
 * @returns '남은 후보 8곳'
 */
export const formatRemaining = (remaining: number): string => `남은 후보 ${remaining}곳`;
