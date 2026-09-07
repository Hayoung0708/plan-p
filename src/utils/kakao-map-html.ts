/** 지도에서 찾은 장소 하나. 카카오 검색 결과는 저장 금지라 화면에만 쓰고 버린다 */
export type MapPlace = {
  id: string;
  name: string;
  address: string;
  /** 카테고리 묶음 코드(PK6, FD6 …). 분류가 없는 장소는 빈 문자열 */
  categoryCode: string;
  /** 화면에 붙일 분류 이름. 묶음 이름이 없으면 세부 분류의 마지막 조각 */
  category: string;
  lat: number;
  lng: number;
};

/** 지도(웹뷰)가 앱으로 올려보내는 이벤트 */
export type MapEvent =
  | { type: 'ready' }
  | { type: 'results'; places: MapPlace[] }
  | { type: 'nearby'; places: MapPlace[] }
  | { type: 'select'; id: string }
  | { type: 'error'; message: string };

/** 앱이 지도로 내려보내는 명령 */
export type MapCommand =
  | { type: 'search'; keyword: string }
  | { type: 'nearby'; lat: number; lng: number; radius: number }
  | {
      type: 'pins';
      pins: MapPin[];
      /** 지금 가야 할 첫 구간. 실선으로 강조한다 */
      activePath?: { lat: number; lng: number }[];
      /** 그다음 후보들까지의 미리보기. 점선으로 흐리게 그린다 */
      path?: { lat: number; lng: number }[];
    }
  | { type: 'focus'; id: string }
  | { type: 'locate'; lat: number; lng: number };

/** 지도에 직접 찍는 점 하나. 검색과 달리 앱이 좌표를 정해서 내려보낸다 */
export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  /** 현재 안내 중인 곳. 하나만 강조하고 나머지는 작은 점으로 찍는다 */
  primary: boolean;
  /** 장소(목적지)는 흰 점, 주차장은 P 글자. 지도만 보고도 무엇인지 구분된다 */
  kind: 'place' | 'parking';
  /** 경로 미리보기에 붙일 순번. 없으면 그냥 점으로 찍는다 */
  label?: string;
};

/** 서울시청. 위치 권한을 받기 전 기본 중심 */
const DEFAULT_CENTER = { lat: 37.5666805, lng: 126.9784147 };

/** 지도 핀의 P 글자에 쓰는 SUIT ExtraBold. 웹뷰 안이라 앱에 번들된 글꼴을 못 쓴다 */
const SUIT_EXTRA_BOLD_URL =
  'https://cdn.jsdelivr.net/gh/sunn-us/SUIT@2/fonts/static/woff2/SUIT-ExtraBold.woff2';

/**
 * 지도 웹뷰에 넣을 HTML을 만든다.
 *
 * 장소 검색을 REST가 아니라 JS SDK services 라이브러리로 처리한다.
 * 키가 하나로 줄고, 웹에서 dapi 직접 호출할 때 생기는 CORS 문제도 없다.
 * @param jsKey 카카오 JavaScript 앱 키
 * @returns 지도 HTML 문서 전체
 */
// eslint-disable-next-line max-lines-per-function -- 분기 없는 HTML 문자열이라 쪼개면 오히려 읽기 어렵다
export const buildKakaoMapHtml = (jsKey: string): string => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  /* 핀의 P 글자용. 앱 본문과 같은 SUIT을 CDN에서 받는다. 못 받으면 시스템 굵은 글꼴로 떨어진다 */
  @font-face {
    font-family: 'SUIT';
    font-weight: 800;
    font-display: swap;
    src: url('${SUIT_EXTRA_BOLD_URL}') format('woff2');
  }
  html, body, #map { height: 100%; margin: 0; padding: 0; overflow: hidden; }
  #fallback { display: none; font: 14px -apple-system, system-ui, sans-serif; color: #6B7280; padding: 24px; }
</style>
</head>
<body>
<div id="map"></div>
<div id="fallback"></div>
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&libraries=services&autoload=false"></script>
<script>
  var post = function (message) {
    var body = JSON.stringify(message);
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(body);
      return;
    }
    parent.postMessage(body, '*');
  };

  var fail = function (message) {
    var box = document.getElementById('fallback');
    box.style.display = 'block';
    box.textContent = message;
    post({ type: 'error', message: message });
  };

  if (!window.kakao || !window.kakao.maps) {
    fail('카카오맵 SDK를 불러오지 못했습니다. JavaScript 키와 등록된 사이트 도메인을 확인하세요.');
  } else {
    kakao.maps.load(function () {
      var map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(${DEFAULT_CENTER.lat}, ${DEFAULT_CENTER.lng}),
        level: 4,
      });
      var places = new kakao.maps.services.Places();
      var geocoder = new kakao.maps.services.Geocoder();
      var markers = [];

      // 지도는 초기화 시점의 컨테이너 크기로 캔버스를 굳힌다.
      // 아이프레임 크기가 나중에 확정되면 지도만 작게 남으므로 크기 변화마다 다시 잡아준다
      var container = document.getElementById('map');
      var relayout = function () { map.relayout(); };
      window.addEventListener('resize', relayout);
      if (window.ResizeObserver) {
        new ResizeObserver(relayout).observe(container);
      }

      // 핀은 카카오 기본 마커 대신 앱 색으로 그린 물방울이다. 장소는 흰 점, 주차장은 P 글자를 얹는다.
      // 끝이 좌표에 닿도록 아래 가운데를 기준점으로 둔다
      var pinSvg = function (kind) {
        var glyph = kind === 'parking'
          ? '<text x="15" y="20" text-anchor="middle" font-family="SUIT, -apple-system, system-ui, sans-serif" font-weight="800" font-size="15" fill="#fff">P</text>'
          : '<circle cx="15" cy="14.8" r="5" fill="#fff"/>';
        return '<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M15 0C6.7 0 0 6.6 0 14.8c0 10.3 12.3 22 13.8 23.2a1.8 1.8 0 0 0 2.4 0C17.7 36.8 30 25.1 30 14.8 30 6.6 23.3 0 15 0z" fill="#2F6BFF"/>' +
          glyph + '</svg>';
      };
      var pinOverlay = function (position, id, kind) {
        var el = document.createElement('div');
        el.innerHTML = pinSvg(kind);
        el.style.cssText = 'width:30px;height:38px;cursor:pointer;filter:drop-shadow(0 3px 4px rgba(15,23,42,.3));';
        el.onclick = function () { post({ type: 'select', id: id }); };
        var overlay = new kakao.maps.CustomOverlay({ map: map, position: position, content: el, yAnchor: 1, zIndex: 5 });
        overlay.__planpId = id;
        return overlay;
      };

      var clearMarkers = function () {
        markers.forEach(function (marker) { marker.setMap(null); });
        markers = [];
      };

      // 지도와 앱이 같은 모양으로 쓰도록 검색 결과를 한 형태로 맞춘 뒤에만 그린다
      var emit = function (list) {
        clearMarkers();
        var bounds = new kakao.maps.LatLngBounds();
        list.forEach(function (place) {
          var position = new kakao.maps.LatLng(place.lat, place.lng);
          markers.push(pinOverlay(position, place.id, 'place'));
          bounds.extend(position);
        });
        if (list.length === 1) {
          map.setCenter(new kakao.maps.LatLng(list[0].lat, list[0].lng));
          map.setLevel(3);
        } else if (list.length > 1) {
          map.setBounds(bounds);
        }
        post({ type: 'results', places: list });
      };

      // 장소로 못 찾으면 주소로 한 번 더 본다. '서울 중구 세종대로 110' 같은 입력을 살린다
      var searchByAddress = function (keyword) {
        geocoder.addressSearch(keyword, function (results, status) {
          if (status !== kakao.maps.services.Status.OK || results.length === 0) {
            emit([]);
            return;
          }
          emit(
            results.map(function (item, index) {
              return {
                id: 'address-' + index,
                name: item.road_address ? item.road_address.address_name : item.address_name,
                address: item.address_name,
                categoryCode: '',
                category: '주소',
                lat: Number(item.y),
                lng: Number(item.x),
              };
            })
          );
        });
      };

      var search = function (keyword) {
        if (!keyword) {
          emit([]);
          return;
        }
        places.keywordSearch(keyword, function (results, status) {
          if (status !== kakao.maps.services.Status.OK) {
            searchByAddress(keyword);
            return;
          }
          emit(
            results.map(function (place) {
              return {
                id: place.id,
                name: place.place_name,
                address: place.road_address_name || place.address_name,
                categoryCode: place.category_group_code || '',
                category:
                  place.category_group_name ||
                  (place.category_name ? place.category_name.split('>').pop().trim() : ''),
                lat: Number(place.y),
                lng: Number(place.x),
              };
            })
          );
        });
      };

      // 공공데이터에 없는 민영 주차장을 채운다. 약관상 저장이 안 되므로 화면에만 쓰고 버린다
      var searchNearbyParking = function (lat, lng, radius) {
        places.categorySearch(
          'PK6',
          function (results, status) {
            if (status !== kakao.maps.services.Status.OK) {
              post({ type: 'nearby', places: [] });
              return;
            }
            post({
              type: 'nearby',
              places: results.map(function (place) {
                return {
                  id: place.id,
                  name: place.place_name,
                  address: place.road_address_name || place.address_name,
                  categoryCode: 'PK6',
                  category: '주차장',
                  lat: Number(place.y),
                  lng: Number(place.x),
                };
              }),
            });
          },
          { location: new kakao.maps.LatLng(lat, lng), radius: radius, sort: 'distance' }
        );
      };

      // 앱이 정한 좌표만 찍는다. 검색과 달리 후보 외의 장소가 지도에 섞이지 않는다.
      // 현재 안내 중인 곳만 마커로 강조하고 나머지는 작은 점으로 둔다
      var overlays = [];
      var clearOverlays = function () {
        overlays.forEach(function (overlay) { overlay.setMap(null); });
        overlays = [];
      };

      var lines = [];
      var clearLines = function () {
        lines.forEach(function (line) { line.setMap(null); });
        lines = [];
      };

      // 순번이 붙은 후보는 원 안에 번호를 넣어 그린다. 미리보기 2·3번이 여기 해당한다
      var numberedDot = function (label) {
        var dot = document.createElement('div');
        dot.textContent = label;
        dot.style.cssText =
          'width:26px;height:26px;border-radius:50%;background:#2F6BFF;color:#fff;' +
          'font:800 13px/26px SUIT,-apple-system,system-ui,sans-serif;text-align:center;' +
          'box-shadow:0 2px 6px rgba(15,23,42,.3);';
        return dot;
      };

      var plainDot = function () {
        var dot = document.createElement('div');
        dot.style.cssText =
          'width:12px;height:12px;border-radius:50%;background:#2F6BFF;opacity:0.45;';
        return dot;
      };

      var drawLine = function (points, isActive) {
        if (!points || points.length < 2) {
          return;
        }
        lines.push(new kakao.maps.Polyline({
          map: map,
          path: points.map(function (point) { return new kakao.maps.LatLng(point.lat, point.lng); }),
          strokeWeight: isActive ? 6 : 4,
          strokeColor: '#1D4ED8',
          strokeOpacity: isActive ? 0.9 : 0.45,
          strokeStyle: isActive ? 'solid' : 'shortdash',
        }));
      };

      var drawPins = function (pins, path, activePath) {
        clearMarkers();
        clearOverlays();
        clearLines();
        var primary = null;

        pins.forEach(function (pin) {
          var position = new kakao.maps.LatLng(pin.lat, pin.lng);
          if (pin.primary) {
            primary = position;
            markers.push(pinOverlay(position, pin.id, pin.kind));
            return;
          }
          var content = pin.label ? numberedDot(pin.label) : plainDot();
          overlays.push(new kakao.maps.CustomOverlay({ map: map, position: position, content: content }));
        });

        // 지금 가야 할 길이 제일 또렷해야 한다. 뒤 후보는 미리보기라 흐린 점선으로 둔다
        drawLine(path, false);
        drawLine(activePath, true);

        // 미리보기 구간에 맞춰 줌을 잡는다. 후보 전체에 맞추면 너무 멀어져 아무것도 안 보인다
        var drawn = (activePath || []).concat(path || []);
        var focusPoints = drawn.length > 1 ? drawn : pins;
        if (focusPoints.length > 1) {
          var bounds = new kakao.maps.LatLngBounds();
          focusPoints.forEach(function (point) {
            bounds.extend(new kakao.maps.LatLng(point.lat, point.lng));
          });
          map.setBounds(bounds, 60, 40, 60, 40);
        } else if (primary) {
          map.setCenter(primary);
          map.setLevel(4);
        }
      };

      // 내 위치는 후보 핀과 다른 모양이어야 한다. 파란 점에 흰 테두리로 지도 앱 관습을 따른다
      var myLocationOverlay = null;
      var showMyLocation = function (lat, lng) {
        var position = new kakao.maps.LatLng(lat, lng);
        if (myLocationOverlay) {
          myLocationOverlay.setMap(null);
        }
        var dot = document.createElement('div');
        dot.style.cssText =
          'width:16px;height:16px;border-radius:8px;background:#1D4ED8;' +
          'border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.15),0 2px 6px rgba(0,0,0,.3);';
        myLocationOverlay = new kakao.maps.CustomOverlay({ map: map, position: position, content: dot, zIndex: 10 });
        map.setCenter(position);
        map.setLevel(4);
      };

      var focus = function (id) {
        var index = markers.findIndex(function (marker) { return marker.__planpId === id; });
        if (index >= 0) {
          map.setCenter(markers[index].getPosition());
          map.setLevel(3);
        }
      };

      window.planpCommand = function (body) {
        var command = typeof body === 'string' ? JSON.parse(body) : body;
        if (command.type === 'search') { search(command.keyword); }
        if (command.type === 'nearby') { searchNearbyParking(command.lat, command.lng, command.radius); }
        if (command.type === 'pins') { drawPins(command.pins, command.path, command.activePath); }
        if (command.type === 'focus') { focus(command.id); }
        if (command.type === 'locate') { showMyLocation(command.lat, command.lng); }
      };

      // 웹(iframe)에서는 부모 창이 postMessage로 명령을 내린다
      window.addEventListener('message', function (event) {
        try { window.planpCommand(event.data); } catch (error) { /* 다른 소스의 메시지는 무시 */ }
      });

      post({ type: 'ready' });
    });
  }
</script>
</body>
</html>`;

/**
 * 지도에서 올라온 문자열 메시지를 이벤트로 바꾼다.
 * @param raw 웹뷰가 보낸 JSON 문자열
 * @returns 파싱된 이벤트. 우리 메시지가 아니면 null
 */
export const parseMapEvent = (raw: string): MapEvent | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && 'type' in parsed) {
      return parsed as MapEvent;
    }
    return null;
  } catch {
    return null;
  }
};
