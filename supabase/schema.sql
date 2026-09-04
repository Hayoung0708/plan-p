-- 플랜P 주차장 원천 DB
-- 공공데이터만 담는다. 카카오 검색 결과는 약관상 저장 금지라 여기 들어오지 않는다.

create extension if not exists postgis;

create table if not exists parking_lots (
  -- 표준데이터의 주차장관리번호(prkplceNo)는 지자체마다 재사용돼 전국 1,137건이 겹친다.
  -- 기관코드+관리번호+이름을 합쳐야 유일해진다
  code text primary key,
  name text not null,
  -- 도로명주소가 비어 있는 행이 많아 지번주소를 함께 둔다
  road_address text,
  address text,
  -- 공영 / 민영
  ownership text,
  -- 노외 / 노상 / 부설
  lot_type text,
  -- 유료 / 무료 / 혼합
  charge_type text,
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
  operator_name text,
  phone text,
  -- 어느 데이터셋에서 왔는지. 서울 API로 보강할 때 덮어쓸 대상을 고르는 기준이 된다
  source text not null default 'standard',
  -- 표준데이터 기준일. 반기 갱신이라 얼마나 묵은 값인지 화면에서 판단해야 한다
  reference_date date,
  geom geography(point, 4326),
  -- 적재 스크립트가 매 실행 시각으로 덮어쓴다. 이 값이 뒤처진 행은 원본에서 사라진 것
  updated_at timestamptz not null default now()
);

-- 반경 검색이 이 앱의 전부다. 인덱스 없으면 매 요청이 풀스캔이 된다
create index if not exists parking_lots_geom_idx on parking_lots using gist (geom);

alter table parking_lots enable row level security;

-- 로그인이 없는 앱이라 읽기는 익명으로 연다. 쓰기는 service_role(적재 스크립트)만
drop policy if exists parking_lots_read on parking_lots;
create policy parking_lots_read on parking_lots for select to anon, authenticated using (true);

-- 후보 큐의 1차 재료. 점수 계산은 클라이언트 순수 모듈에서 하고 여기서는 거리순으로만 잘라 준다
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
  charge_type text,
  lot_type text,
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
    coalesce(nullif(l.road_address, ''), l.address) as address,
    l.total_spaces,
    l.base_fee,
    l.base_minutes,
    l.charge_type,
    l.lot_type,
    st_y(l.geom::geometry) as lat,
    st_x(l.geom::geometry) as lng,
    st_distance(l.geom, st_point(center_lng, center_lat)::geography) as distance_m
  from parking_lots as l
  where l.geom is not null
    and st_dwithin(l.geom, st_point(center_lng, center_lat)::geography, radius_m)
    and (not free_only or l.charge_type = '무료')
  order by distance_m
  limit max_rows;
$$;
