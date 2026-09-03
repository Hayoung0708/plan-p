-- 플랜P 주차장 원천 DB
-- 공공데이터만 담는다. 카카오 검색 결과는 약관상 저장 금지라 여기 들어오지 않는다.

create extension if not exists postgis;

create table if not exists parking_lots (
  -- 서울 열린데이터광장 PKLT_CD. 갱신 때 이 값으로 덮어쓴다
  code text primary key,
  name text not null,
  address text not null,
  -- 노외/노상/부설 구분(PKLT_KND_NM)
  kind text,
  -- 시간제/월정기 등 운영 구분(OPER_SE_NM). 월주차 전용은 후보에서 뺀다
  operator text,
  is_paid boolean not null default true,
  total_spaces integer,
  -- 기본요금 base_fee원 / base_minutes분, 추가요금 add_fee원 / add_minutes분
  base_fee integer,
  base_minutes integer,
  add_fee integer,
  add_minutes integer,
  daily_max_fee integer,
  monthly_fee integer,
  weekday_open text,
  weekday_close text,
  weekend_open text,
  weekend_close text,
  holiday_open text,
  holiday_close text,
  -- PRK_NOW_INFO_PVSN_YN: 1=20분 이내 연계, 2=수집중, 그 외=미연계
  realtime_level smallint,
  -- 서울 API가 좌표를 안 줘서 브이월드 지오코딩 결과를 넣는다
  geom geography(point, 4326),
  updated_at timestamptz not null default now()
);

-- 반경 검색이 이 앱의 전부다. 인덱스 없으면 2천 건이어도 매 요청이 풀스캔이 된다
create index if not exists parking_lots_geom_idx on parking_lots using gist (geom);

alter table parking_lots enable row level security;

-- 로그인이 없는 앱이라 읽기는 익명으로 연다. 쓰기는 service_role(적재 스크립트)만
drop policy if exists parking_lots_read on parking_lots;
create policy parking_lots_read on parking_lots for select to anon, authenticated using (true);

-- 후보 큐의 1차 재료. 점수 계산은 클라이언트에서 하고 여기서는 거리순으로만 잘라 준다
create or replace function lots_within(
  center_lat double precision,
  center_lng double precision,
  radius_m integer,
  free_only boolean default false,
  max_rows integer default 50
)
returns table (
  code text,
  name text,
  address text,
  total_spaces integer,
  base_fee integer,
  base_minutes integer,
  is_paid boolean,
  realtime_level smallint,
  lat double precision,
  lng double precision,
  distance_m double precision
)
language sql
stable
as $$
  select
    l.code,
    l.name,
    l.address,
    l.total_spaces,
    l.base_fee,
    l.base_minutes,
    l.is_paid,
    l.realtime_level,
    st_y(l.geom::geometry) as lat,
    st_x(l.geom::geometry) as lng,
    st_distance(l.geom, st_point(center_lng, center_lat)::geography) as distance_m
  from parking_lots as l
  where l.geom is not null
    and st_dwithin(l.geom, st_point(center_lng, center_lat)::geography, radius_m)
    and (not free_only or l.is_paid = false)
    -- 월주차 전용은 잠깐 대러 가는 곳이 아니다
    and coalesce(l.operator, '') not like '%월정기%'
  order by distance_m
  limit max_rows;
$$;
