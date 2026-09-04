import { useEffect, useState } from 'react';

import { DATA_GO_KR_KEY, JUSO_KEY } from '@/constants/env';
import type { BuildingParking, BuildingRegistryItem } from '@/utils/building-parking';
import { sumBuildingParking } from '@/utils/building-parking';

const JUSO_URL = 'https://business.juso.go.kr/addrlink/addrLinkApi.do';
const REGISTRY_URL = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';

export type BuildingParkingState = {
  /** 건물 주차 정보. 아직 모르면 null */
  parking: BuildingParking | null;
  isLoading: boolean;
  /** 조회 실패나 대장 없음. 빈 문자열이면 정상 */
  error: string;
};

type JusoResult = { admCd: string; lnbrMnnm: string; lnbrSlno: string };

/**
 * 주소를 법정동코드와 본번·부번으로 바꾼다.
 * 건축물대장은 주소 문자열을 받지 않아서 이 변환이 반드시 앞에 붙는다.
 * @param address 도로명 또는 지번 주소
 * @returns 코드 정보. 못 찾으면 null
 */
const findAddressCode = async (address: string): Promise<JusoResult | null> => {
  const url = new URL(JUSO_URL);
  url.search = new URLSearchParams({
    confmKey: JUSO_KEY,
    currentPage: '1',
    countPerPage: '1',
    keyword: address,
    resultType: 'json',
  }).toString();
  const body = (await (await fetch(url)).json()) as {
    results: { juso: JusoResult[] | null };
  };
  return body.results.juso?.[0] ?? null;
};

/**
 * 건축물대장 표제부를 조회한다.
 * @param code 법정동코드와 본번·부번
 * @returns 표제부 항목들
 */
const fetchRegistry = async (code: JusoResult): Promise<BuildingRegistryItem[]> => {
  const { admCd, lnbrMnnm, lnbrSlno } = code;
  const url = new URL(REGISTRY_URL);
  url.search = new URLSearchParams({
    serviceKey: DATA_GO_KR_KEY,
    // 법정동코드 10자리는 앞 5자리가 시군구, 뒤 5자리가 법정동이다
    sigunguCd: admCd.slice(0, 5),
    bjdongCd: admCd.slice(5),
    platGbCd: '0',
    bun: lnbrMnnm.padStart(4, '0'),
    ji: lnbrSlno.padStart(4, '0'),
    _type: 'json',
    numOfRows: '20',
    pageNo: '1',
  }).toString();
  const body = (await (await fetch(url)).json()) as {
    response: { body: { items?: { item?: BuildingRegistryItem | BuildingRegistryItem[] } } };
  };
  const item = body.response.body.items?.item;
  if (item === undefined) {
    return [];
  }
  return Array.isArray(item) ? item : [item];
};

/**
 * 목적지 건물의 주차 대수를 조회한다.
 *
 * 주차장이 아예 없는 건물이면 "이 건물 주차 불가"를 추측이 아니라 대장 기준으로 말할 수 있다.
 * @param address 목적지 주소
 * @returns 건물 주차 정보와 상태
 */
export const useBuildingParking = (address: string): BuildingParkingState => {
  const [state, setState] = useState<BuildingParkingState>({
    parking: null,
    isLoading: true,
    error: '',
  });

  const canQuery = address !== '' && JUSO_KEY !== '' && DATA_GO_KR_KEY !== '';

  useEffect(() => {
    if (!canQuery) {
      return;
    }
    let isActive = true;

    findAddressCode(address)
      .then(async (code) => {
        if (code === null) {
          throw new Error('주소를 찾지 못했습니다');
        }
        return sumBuildingParking(await fetchRegistry(code));
      })
      .then((parking) => {
        if (isActive) {
          setState({ parking, isLoading: false, error: '' });
        }
      })
      .catch(() => {
        if (isActive) {
          setState({
            parking: null,
            isLoading: false,
            error: '건물 주차 정보를 확인할 수 없습니다',
          });
        }
      });

    return (): void => {
      isActive = false;
    };
  }, [address, canQuery]);

  if (!canQuery) {
    return { parking: null, isLoading: false, error: '건물 주차 정보를 확인할 수 없습니다' };
  }
  return state;
};
