/**
 * 시트의 처음 높이(px). 제목 줄(62) + 결과 4행(68×4)에 행 위 여백만 살짝 남긴 값이라
 * 5번째 행이 잘려 보이지 않는다. 행 높이가 바뀌면 같이 맞춰야 한다.
 * 스크롤하면 시트가 이 높이에서 시작해 화면 위로 계속 올라간다
 */
export const SHEET_COLLAPSED_HEIGHT = 346;

/** 검색 전·결과 없음 시트 높이(px). 아이콘과 두 줄 안내만 담으니 결과 시트보다 낮다 */
export const SHEET_EMPTY_HEIGHT = 220;

/**
 * 홈 상단 검색 헤더 높이(안전 영역 제외). 검색 알약 56 + 위아래 여백 12.
 * 시트가 이 아래까지만 올라오고, 다 올라오면 헤더가 흰 바탕과 밑선을 갖는다
 */
export const HOME_HEADER_HEIGHT = 80;

/** 반경 프리셋(도보 분). 사용자가 만지는 값은 이것과 무료 토글 둘뿐 */
export const RADIUS_PRESETS = [5, 10, 15] as const;

/** 후보가 이 수 이하로 줄면 반경 넓히기를 먼저 제안한다 */
export const LOW_CANDIDATE_THRESHOLD = 3;

/** 한 번에 받아올 후보 최대 수. 도심이면 20곳도 넘지만 실제 방문은 1~3곳이다 */
export const MAX_CANDIDATES = 30;

/** 경로 미리보기에 그릴 후보 수. 더 그리면 선이 엉켜 순서를 못 읽는다 */
export const ROUTE_PREVIEW_COUNT = 3;
