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
  | { type: 'select'; id: string }
  | { type: 'error'; message: string };

/** 앱이 지도로 내려보내는 명령 */
export type MapCommand = { type: 'search'; keyword: string } | { type: 'focus'; id: string };

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
