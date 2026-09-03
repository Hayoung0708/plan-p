/**
 * 서울 공영주차장 수집 → 좌표 변환 → Supabase 적재.
 *
 * 실행: node scripts/ingest-seoul-parking.mjs
 * 필요한 환경변수(.env): SEOUL_API_KEY, VWORLD_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * 서울 API는 좌표를 주지 않는다(LAT/LOT가 전부 0). 그래서 지번 주소를 브이월드로 한 번
 * 변환해 DB에 넣는다. 카카오 지오코딩을 쓰지 않는 이유는 약관상 결과 저장이 막혀서다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SEOUL_KEY = process.env.SEOUL_API_KEY ?? '';
const VWORLD_KEY = process.env.VWORLD_API_KEY ?? '';
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** 서울 API 한 번에 가져올 수 있는 최대 행 수 */
const PAGE_SIZE = 1000;
/** 지오코딩 결과 캐시. 주소는 잘 안 변해서 한 번 변환하면 계속 쓴다 */
const GEOCODE_CACHE = 'scripts/.geocode-cache.json';
/** 브이월드 초당 요청 제한을 넘기지 않으려는 간격(ms) */
const GEOCODE_DELAY_MS = 120;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requireEnv = () => {
  const missing = Object.entries({ SEOUL_API_KEY: SEOUL_KEY, VWORLD_API_KEY: VWORLD_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SUPABASE_KEY })
    .filter(([, value]) => value === '')
    .map(([name]) => name);
  if (missing.length > 0) {
    console.error('환경변수 없음: ' + missing.join(', '));
    process.exit(1);
  }
};

/** 서울 공영주차장 안내 정보(OA-13122) 전체를 페이지 단위로 받아 온다 */
const fetchSeoulLots = async () => {
  const rows = [];
  let start = 1;
  for (;;) {
    const end = start + PAGE_SIZE - 1;
    const url = `http://openapi.seoul.go.kr:8088/${SEOUL_KEY}/json/GetParkInfo/${start}/${end}/`;
    const body = await (await fetch(url)).json();
    const payload = body.GetParkInfo;
    if (!payload || payload.RESULT?.CODE !== 'INFO-000') {
      throw new Error('서울 API 응답 오류: ' + JSON.stringify(body).slice(0, 300));
    }
    rows.push(...payload.row);
    console.log(`  받음 ${rows.length}/${payload.list_total_count}`);
    if (rows.length >= payload.list_total_count) {
      return rows;
    }
    start = end + 1;
  }
};

/** 브이월드로 지번 주소 하나를 좌표로 바꾼다. 실패하면 null */
const geocode = async (address) => {
  const params = new URLSearchParams({
    service: 'address',
    request: 'getcoord',
    version: '2.0',
    crs: 'epsg:4326',
    type: 'PARCEL',
    format: 'json',
    key: VWORLD_KEY,
    address,
  });
  const body = await (await fetch('https://api.vworld.kr/req/address?' + params)).json();
  const point = body.response?.result?.point;
  if (body.response?.status !== 'OK' || !point) {
    return null;
  }
  return { lat: Number(point.y), lng: Number(point.x) };
};

/** 서울 API 한 행을 DB 컬럼 모양으로 바꾼다 */
const toRow = (item, coords) => ({
  code: item.PKLT_CD,
  name: item.PKLT_NM,
  address: item.ADDR,
  kind: item.PKLT_KND_NM || null,
  operator: item.OPER_SE_NM || null,
  is_paid: item.CHGD_FREE_SE === 'Y',
  total_spaces: Number(item.TPKCT) || null,
  base_fee: Number(item.PRK_CRG) || 0,
  base_minutes: Number(item.PRK_HM) || 0,
  add_fee: Number(item.ADD_CRG) || 0,
  add_minutes: Number(item.ADD_UNIT_TM_MNT) || 0,
  daily_max_fee: Number(item.DLY_MAX_CRG) || 0,
  monthly_fee: Number(item.MNTL_CMUT_CRG) || 0,
  weekday_open: item.WD_OPER_BGNG_TM || null,
  weekday_close: item.WD_OPER_END_TM || null,
  weekend_open: item.WE_OPER_BGNG_TM || null,
  weekend_close: item.WE_OPER_END_TM || null,
  holiday_open: item.LHLDY_BGNG || null,
  holiday_close: item.LHLDY || null,
  realtime_level: Number(item.PRK_NOW_INFO_PVSN_YN) || 0,
  geom: coords === null ? null : `SRID=4326;POINT(${coords.lng} ${coords.lat})`,
});

/** Supabase에 upsert. 한 번에 다 보내면 요청이 너무 커져서 잘라 보낸다 */
const upsert = async (rows) => {
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
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
    console.log(`  적재 ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
};

const main = async () => {
  requireEnv();

  console.log('1) 서울 공영주차장 수집');
  const items = await fetchSeoulLots();

  console.log('2) 좌표 변환');
  const cache = existsSync(GEOCODE_CACHE) ? JSON.parse(readFileSync(GEOCODE_CACHE, 'utf8')) : {};
  let failed = 0;
  const rows = [];
  for (const item of items) {
    const address = item.ADDR;
    if (!(address in cache)) {
      cache[address] = await geocode(address);
      await sleep(GEOCODE_DELAY_MS);
      if (Object.keys(cache).length % 100 === 0) {
        writeFileSync(GEOCODE_CACHE, JSON.stringify(cache));
      }
    }
    if (cache[address] === null) {
      failed += 1;
    }
    rows.push(toRow(item, cache[address]));
  }
  writeFileSync(GEOCODE_CACHE, JSON.stringify(cache));
  console.log(`  좌표 확보 ${rows.length - failed}/${rows.length} (실패 ${failed})`);

  console.log('3) Supabase 적재');
  await upsert(rows);
  console.log('완료');
};

await main();
