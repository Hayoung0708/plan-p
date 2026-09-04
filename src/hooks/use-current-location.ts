import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type Coordinate = { lat: number; lng: number };

export type CurrentLocationState = {
  /** 현재 위치. 권한 거부나 실패면 null */
  location: Coordinate | null;
  isLoading: boolean;
  /** 권한이 거부된 상태. 버튼 문구를 바꾸는 데 쓴다 */
  isDenied: boolean;
  /** 위치를 읽는다. 사용자가 버튼을 눌렀을 때처럼 명시적인 시점에 부른다 */
  request: () => void;
};

export type CurrentLocationOptions = {
  /**
   * 마운트되자마자 위치를 읽을지 여부.
   * 앱을 켜자마자 권한 팝업을 띄우면 맥락 없이 거부당하고, 한 번 거부되면 설정 앱까지 들어가야 한다.
   * 그래서 홈 화면은 false로 두고 버튼을 눌렀을 때만 묻는다.
   */
  auto?: boolean;
};

/**
 * 기기의 현재 위치를 읽는다.
 *
 * 상시 추적은 하지 않는다. 배터리를 먹고, 지금 필요한 건 후보 순서를 정할 기준점 하나뿐이다.
 * 권한을 거부해도 앱은 목적지 기준으로 계속 동작해야 하므로 실패를 오류로 다루지 않는다.
 * @param options 마운트 시 자동 조회 여부
 * @returns 현재 위치와 상태, 재조회 함수
 */
export const useCurrentLocation = ({
  auto = true,
}: CurrentLocationOptions = {}): CurrentLocationState => {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [isDenied, setIsDenied] = useState(false);
  const [requestCount, setRequestCount] = useState(auto ? 1 : 0);

  const request = useCallback((): void => setRequestCount((count) => count + 1), []);

  useEffect(() => {
    if (requestCount === 0) {
      return;
    }
    let isActive = true;

    Location.requestForegroundPermissionsAsync()
      .then(async ({ granted }) => {
        if (!granted) {
          return null;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return { lat: position.coords.latitude, lng: position.coords.longitude };
      })
      .then((next) => {
        if (isActive) {
          setLocation(next);
          setIsDenied(next === null);
          setDoneCount(requestCount);
        }
      })
      .catch(() => {
        if (isActive) {
          setIsDenied(true);
          setDoneCount(requestCount);
        }
      });

    return (): void => {
      isActive = false;
    };
  }, [requestCount]);

  return { location, isLoading: requestCount > doneCount, isDenied, request };
};
