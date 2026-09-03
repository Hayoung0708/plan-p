import type { Availability } from '@/types/parking';

/**
 * 시간당 요금을 화면 문구로 바꾼다.
 * @param hourlyFee 시간당 요금(원). 민영은 요금 데이터가 없어 null이 들어온다
 * @returns '5,000원/시간' 또는 '요금 정보 없음'
 */
export const formatFee = (hourlyFee: number | null): string => {
  if (hourlyFee === null) {
    return '요금 정보 없음';
  }
  return `${hourlyFee.toLocaleString('ko-KR')}원/시간`;
};

/**
 * 잔여면수 상태를 화면 문구로 바꾼다.
 * @param availability 실시간·추정·미상 중 하나
 * @returns 사용자에게 보여줄 한 줄
 */
export const formatAvailability = (availability: Availability): string => {
  if (availability.kind === 'live') {
    const { freeSpaces, updatedMinutesAgo } = availability;
    return `여유 ${freeSpaces}면 · ${updatedMinutesAgo}분 전 갱신`;
  }
  if (availability.kind === 'estimated') {
    const { level } = availability;
    const labels = { low: '여유 예상', medium: '보통 예상', high: '혼잡 예상' } as const;
    return `${labels[level]} · 실시간 없음`;
  }
  return '실시간 정보 없음';
};

/**
 * 남은 후보 수를 문구로 바꾼다. '1/9' 같은 진행률은 쓰지 않는다.
 * 몇 번 실패했는지 세게 만들면 앱을 안 믿게 된다.
 * @param remaining 아직 안 가본 후보 수
 * @returns '남은 후보 8곳'
 */
export const formatRemaining = (remaining: number): string => `남은 후보 ${remaining}곳`;
