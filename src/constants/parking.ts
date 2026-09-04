/** 검색 결과 시트 높이. 플로팅 버튼을 이 위에 띄운다 */
export const SHEET_HEIGHT = 280;

/** 반경 프리셋(도보 분). 사용자가 만지는 값은 이것과 무료 토글 둘뿐 */
export const RADIUS_PRESETS = [5, 10, 15] as const;

/** 후보가 이 수 이하로 줄면 반경 넓히기를 먼저 제안한다 */
export const LOW_CANDIDATE_THRESHOLD = 3;

/** 한 번에 받아올 후보 최대 수. 도심이면 20곳도 넘지만 실제 방문은 1~3곳이다 */
export const MAX_CANDIDATES = 30;

/** 경로 미리보기에 그릴 후보 수. 더 그리면 선이 엉켜 순서를 못 읽는다 */
export const ROUTE_PREVIEW_COUNT = 3;
