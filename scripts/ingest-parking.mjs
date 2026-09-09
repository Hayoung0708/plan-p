/**
 * 전국주차장정보표준데이터 수집 → Supabase 적재.
 *
 * 실행: npm run ingest            (서울만 적재)
 *       npm run ingest -- --all   (전국 적재)
 *       npm run ingest -- --dry   (Supabase 없이 통계만 확인)
 *
 * 필요한 환경변수(.env): DATA_GO_KR_SERVICE_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * 표준데이터는 위경도를 직접 주므로 별도 지오코딩이 필요 없다.
 * 다만 반기 갱신이라 폐업·요금 변경이 늦고, 서울 커버리지가 856곳으로 서울시 자체
 * API(2,186곳)보다 적다. 커버리지 보강은 좌표 확보 방법을 정한 뒤 따로 붙인다.
 */
const API_URL = 'https://api.data.go.kr/openapi/tn_pubr_prkplce_info_api';
const PAGE_SIZE = 1000;
/** 한 번에 보낼 적재 행 수. 더 키우면 요청 본문이 커져 타임아웃이 난다 */
const UPSERT_CHUNK = 500;
/** 한반도 밖 좌표는 지자체 입력 오류다. 반경 검색에 섞이면 엉뚱한 후보가 나온다 */
const KOREA_BOUNDS = { latMin: 33, latMax: 39, lngMin: 124, lngMax: 132 };
/** 이 수보다 적게 수집되면 원본 장애로 보고 삭제 정리를 건너뛴다 */
const MIN_ROWS_TO_PRUNE = 100;

const SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY ?? '';
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const isDryRun = process.argv.includes('--dry');
const isNationwide = process.argv.includes('--all');

/** 숫자 문자열을 정수로. 빈 값과 잘못된 값은 null로 떨어뜨린다 */
const toInt = (value) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) && parsed !== 0 ? Math.round(parsed) : null;
};

/** '2026-04-20' 형태만 통과시킨다. 지자체가 빈 값이나 다른 형식을 넣기도 한다 */
const toDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? '')) ? value : null);

/** 좌표가 한반도 안에 있는지. 벗어나면 좌표 없는 행으로 취급한다 */
const toPoint = (lat, lng) => {
  const y = Number(lat);
  const x = Number(lng);
  const inBounds =
    y > KOREA_BOUNDS.latMin &&
    y < KOREA_BOUNDS.latMax &&
    x > KOREA_BOUNDS.lngMin &&
    x < KOREA_BOUNDS.lngMax;
  return inBounds ? `SRID=4326;POINT(${x} ${y})` : null;
};

/** 표준데이터 한 행을 DB 컬럼 모양으로 바꾼다 */
const toRow = (item, syncedAt) => ({
  code: `${item.insttCode}:${item.prkplceNo}:${item.prkplceNm}`,
  name: item.prkplceNm,
  road_address: item.rdnmadr || null,
  address: item.lnmadr || null,
  ownership: item.prkplceSe || null,
  lot_type: item.prkplceType || null,
  charge_type: item.parkingchrgeInfo || null,
  total_spaces: toInt(item.prkcmprt),
  base_fee: toInt(item.basicCharge),
  base_minutes: toInt(item.basicTime),
  add_fee: toInt(item.addUnitCharge),
  add_minutes: toInt(item.addUnitTime),
  daily_max_fee: toInt(item.dayCmmtkt),
  monthly_fee: toInt(item.monthCmmtkt),
  weekday_open: item.weekdayOperOpenHhmm || null,
  weekday_close: item.weekdayOperColseHhmm || null,
  weekend_open: item.satOperOperOpenHhmm || null,
  weekend_close: item.satOperCloseHhmm || null,
  holiday_open: item.holidayOperOpenHhmm || null,
  holiday_close: item.holidayCloseOpenHhmm || null,
  operator_name: item.institutionNm || null,
  phone: item.phoneNumber || null,
  source: 'standard',
  reference_date: toDate(item.referenceDate),
  updated_at: syncedAt,
  geom: toPoint(item.latitude, item.longitude),
});

/** 표준데이터 전체를 페이지 단위로 받아 온다 */
const fetchAll = async () => {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const url = `${API_URL}?serviceKey=${SERVICE_KEY}&type=json&numOfRows=${PAGE_SIZE}&pageNo=${page}`;
    const body = await (await fetch(url)).json();
    if (body.header?.resultCode !== '00') {
      throw new Error('API 오류: ' + JSON.stringify(body).slice(0, 300));
    }
    const items = body.body.items?.item ?? [];
    rows.push(...items);
    process.stdout.write(`\r  받음 ${rows.length}/${body.body.totalCount}`);
    if (items.length === 0 || rows.length >= body.body.totalCount) {
      process.stdout.write('\n');
      return rows;
    }
  }
};

/** 같은 code가 3건 정도 겹친다. 나중 행이 최신이라 보고 덮어쓴다 */
const dedupe = (rows) => [...new Map(rows.map((row) => [row.code, row])).values()];

/**
 * 이번 수집에 없던 표준데이터 행을 지운다.
 * 폐업한 주차장이 DB에 남아 있으면 만차가 아니라 아예 없는 곳으로 안내하게 된다.
 * 실패한 수집으로 전부 지우는 사고를 막으려고, 수집 건수가 너무 적으면 건너뛴다.
 */
const removeVanished = async (syncedAt, ingestedCount) => {
  if (ingestedCount < MIN_ROWS_TO_PRUNE) {
    console.log(`  수집이 ${ingestedCount}건뿐이라 정리를 건너뜀`);
    return;
  }
  const query = `source=eq.standard&updated_at=lt.${encodeURIComponent(syncedAt)}`;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/parking_lots?${query}`, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=representation',
    },
  });
  if (!response.ok) {
    throw new Error('정리 실패: ' + (await response.text()).slice(0, 300));
  }
  const removed = await response.json();
  console.log(`  원본에서 사라진 ${removed.length}곳 삭제`);
};

/** Supabase에 upsert. 한 번에 다 보내면 요청이 커져서 잘라 보낸다 */
const upsert = async (rows) => {
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/parking_lots?on_conflict=code`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(chunk),
    });
    if (!response.ok) {
      throw new Error('적재 실패: ' + (await response.text()).slice(0, 300));
    }
    process.stdout.write(`\r  적재 ${Math.min(i + UPSERT_CHUNK, rows.length)}/${rows.length}`);
  }
  process.stdout.write('\n');
};

const main = async () => {
  if (SERVICE_KEY === '') {
    console.error('환경변수 없음: DATA_GO_KR_SERVICE_KEY');
    process.exit(1);
  }

  console.log('1) 전국주차장정보표준데이터 수집');
  const items = await fetchAll();

  const target = isNationwide
    ? items
    : items.filter((item) => (item.lnmadr || item.rdnmadr || '').startsWith('서울'));
  const syncedAt = new Date().toISOString();
  const rows = dedupe(target.map((item) => toRow(item, syncedAt)));
  const located = rows.filter((row) => row.geom !== null).length;

  console.log(
    `2) 정제: ${rows.length}곳 (좌표 정상 ${located}, 좌표 이상 ${rows.length - located})`,
  );
  console.log(`   범위: ${isNationwide ? '전국' : '서울'}`);

  if (isDryRun) {
    console.log('   --dry 모드라 적재는 건너뜀');
    console.log('   샘플: ' + JSON.stringify(rows[0]));
    return;
  }

  if (SUPABASE_URL === '' || SUPABASE_KEY === '') {
    console.error('환경변수 없음: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('3) Supabase 적재');
  await upsert(rows);
  await removeVanished(syncedAt, rows.length);
  console.log('완료');
};

await main();
