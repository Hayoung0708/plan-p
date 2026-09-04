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
  | { type: 'focus'; id: string };

/** 지도에 직접 찍는 점 하나. 검색과 달리 앱이 좌표를 정해서 내려보낸다 */
export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  /** 현재 안내 중인 곳. 하나만 강조하고 나머지는 작은 점으로 찍는다 */
  primary: boolean;
  /** 경로 미리보기에 붙일 순번. 없으면 그냥 점으로 찍는다 */
  label?: string;
};

/** 서울시청. 위치 권한을 받기 전 기본 중심 */
const DEFAULT_CENTER = { lat: 37.5666805, lng: 126.9784147 };

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
          var marker = new kakao.maps.Marker({ map: map, position: position });
          kakao.maps.event.addListener(marker, 'click', function () {
            post({ type: 'select', id: place.id });
          });
          markers.push(marker);
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

      // 순번이 붙은 후보는 원 안에 번호를 넣어 그린다. 미리보기 3곳이 여기 해당한다
      var numberedDot = function (label) {
        var dot = document.createElement('div');
        dot.textContent = label;
        dot.style.cssText =
          'width:22px;height:22px;border-radius:11px;background:#1D4ED8;color:#fff;' +
          'font:700 12px/22px -apple-system,system-ui,sans-serif;text-align:center;' +
          'border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);';
        return dot;
      };

      var plainDot = function () {
        var dot = document.createElement('div');
        dot.style.cssText =
          'width:10px;height:10px;border-radius:5px;background:#1D4ED8;opacity:0.45;border:2px solid #fff;';
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
            var marker = new kakao.maps.Marker({ map: map, position: position });
            kakao.maps.event.addListener(marker, 'click', function () {
              post({ type: 'select', id: pin.id });
            });
            markers.push(marker);
            return;
          }
          var content = pin.label ? numberedDot(pin.label) : plainDot();
          var overlay = new kakao.maps.CustomOverlay({ map: map, position: position, content: content });
          overlays.push(overlay);
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
