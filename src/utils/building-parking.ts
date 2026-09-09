/** 건축물대장에서 뽑아낸 건물 주차 정보 */
export type BuildingParking = {
  /** 옥내·옥외, 자주식·기계식을 모두 더한 주차 대수 */
  totalSpaces: number;
  /** 건물 이름. 없으면 빈 문자열 */
  buildingName: string;
};

/** 건축물대장 표제부에서 쓰는 주차 대수 필드 */
export type BuildingRegistryItem = {
  bldNm?: string;
  indrMechUtcnt?: number;
  oudrMechUtcnt?: number;
  indrAutoUtcnt?: number;
  oudrAutoUtcnt?: number;
};

/**
 * 건축물대장 표제부 여러 건에서 주차 대수를 합친다.
 *
 * 한 지번에 동이 여러 개인 건물이 있어 항목이 여러 건 온다. 주차장은 단지 공용이라 합산한다.
 * @param items 표제부 항목들
 * @returns 합산된 주차 정보. 항목이 없으면 null
 */
export const sumBuildingParking = (items: BuildingRegistryItem[]): BuildingParking | null => {
  if (items.length === 0) {
    return null;
  }
  const totalSpaces = items.reduce(
    (sum, item) =>
      sum +
      (item.indrMechUtcnt ?? 0) +
      (item.oudrMechUtcnt ?? 0) +
      (item.indrAutoUtcnt ?? 0) +
      (item.oudrAutoUtcnt ?? 0),
    0,
  );
  return { totalSpaces, buildingName: items[0].bldNm ?? '' };
};
