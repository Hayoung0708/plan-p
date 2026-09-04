import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type Coordinate = { lat: number; lng: number };

export type CurrentLocationState = {
  /** 현재 위치. 권한 거부나 실패면 null */
  location: Coordinate | null;
  isLoading: boolean;
};

/**
 * 기기의 현재 위치를 한 번 읽는다.
 *
 * 상시 추적은 하지 않는다. 배터리를 먹고, 지금 필요한 건 후보 순서를 정할 기준점 하나뿐이다.
 * 권한을 거부해도 앱은 목적지 기준으로 계속 동작해야 하므로 실패를 오류로 다루지 않는다.
 * @returns 현재 위치와 로딩 상태
 */
export const useCurrentLocation = (): CurrentLocationState => {
  const [state, setState] = useState<CurrentLocationState>({ location: null, isLoading: true });

  useEffect(() => {
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
      .then((location) => {
        if (isActive) {
          setState({ location, isLoading: false });
        }
      })
      .catch(() => {
        if (isActive) {
          setState({ location: null, isLoading: false });
        }
      });

    return (): void => {
      isActive = false;
    };
  }, []);

  return state;
};
