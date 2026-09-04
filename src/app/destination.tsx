import { router, useLocalSearchParams } from 'expo-router';
import type { JSX } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { DriveButton } from '@/components/drive-button';
import { KakaoMap } from '@/components/kakao-map';
import { SheetHeader } from '@/components/sheet-header';
import { RADIUS_PRESETS } from '@/constants/parking';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useBuildingParking } from '@/hooks/use-building-parking';
import { useKakaoNearby } from '@/hooks/use-kakao-nearby';
import { useNearbyLots } from '@/hooks/use-nearby-lots';
import { radiusMetersFromWalkMinutes } from '@/utils/distance';
import type { BuildingParkingState } from '@/hooks/use-building-parking';
import { distanceMeters, mergeLots } from '@/utils/merge-lots';

const styles = StyleSheet.create({
  address: { color: Colors.muted, fontSize: 14, marginTop: Spacing.xs },
  count: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: Spacing.lg },
  countMuted: { color: Colors.muted, fontWeight: '400' },
  map: { borderRadius: Radius.md, height: 140, marginTop: Spacing.lg, overflow: 'hidden' },
  name: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  notice: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    color: Colors.muted,
    fontSize: 14,
    marginVertical: Spacing.lg,
    padding: Spacing.md,
  },
  noticeWarn: { color: Colors.warn, fontWeight: '700' },
  preset: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  presetOn: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  presetRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  presetText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  presetTextOn: { color: Colors.onBrand },
  screen: { backgroundColor: Colors.background, flex: 1, padding: Spacing.xl },
  sectionTitle: { color: Colors.muted, fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  toggleText: { color: Colors.text, fontSize: 16 },
});

/**
 * 목적지 건물 자체의 주차 가능 여부. 없으면 확실히 없다고 말해 준다.
 * 도착해서야 아는 것이 이 앱이 없애려는 경험이다.
 * @param props 건물 주차 조회 상태
 * @returns 안내 한 줄
 */
const BuildingNotice = ({ state }: { state: BuildingParkingState }): JSX.Element => {
  const { parking, isLoading, error } = state;
  if (isLoading) {
    return <Text style={styles.notice}>건물 주차장 확인 중…</Text>;
  }
  if (error !== '' || parking === null) {
    return <Text style={styles.notice}>건물 주차장 정보 없음</Text>;
  }
  if (parking.totalSpaces === 0) {
    return <Text style={[styles.notice, styles.noticeWarn]}>이 건물 주차 불가</Text>;
  }
  return <Text style={styles.notice}>건물 주차 가능 · {parking.totalSpaces}면</Text>;
};

/**
 * 후보 수 한 줄. 찾는 중·실패·성공을 같은 자리에 보여 준다.
 * @param props 후보 수, 로딩 여부, 오류
 * @returns 후보 수 문구
 */
const CandidateCount = ({
  count,
  isLoading,
  error,
}: {
  count: number;
  isLoading: boolean;
  error: string;
}): JSX.Element => {
  if (isLoading) {
    return <Text style={[styles.count, styles.countMuted]}>후보 찾는 중…</Text>;
  }
  if (error !== '') {
    return <Text style={[styles.count, styles.countMuted]}>{error}</Text>;
  }
  return <Text style={styles.count}>후보 {count}곳 찾음</Text>;
};

/**
 * 목적지 확인 시트. 반경과 무료 여부만 고르게 하고 후보 수를 먼저 알린다.
 *
 * 건물 자체 주차장 유무는 건축물대장 API를 붙인 뒤에 채운다.
 * @returns 목적지 시트
 */
const DestinationSheet = (): JSX.Element => {
  const params = useLocalSearchParams<{
    name?: string;
    address?: string;
    lat?: string;
    lng?: string;
  }>();
  const [walkMinutes, setWalkMinutes] = useState<number>(RADIUS_PRESETS[1]);
  const [freeOnly, setFreeOnly] = useState(false);
  const { name = '목적지', address = '', lat = '', lng = '' } = params;

  const center = { lat: Number(lat), lng: Number(lng) };
  const { lots, isLoading, error } = useNearbyLots({ ...center, walkMinutes, freeOnly });
  // 안내 화면과 같은 기준으로 세야 후보 수가 어긋나지 않는다
  const { lots: kakaoLots, handleMapEvent } = useKakaoNearby(center, distanceMeters);
  const candidates = freeOnly ? lots : mergeLots(lots, kakaoLots);
  const building = useBuildingParking(address);

  /**
   * 후보를 들고 안내 화면으로. 같은 조건으로 다시 조회하도록 파라미터를 넘긴다.
   * @returns 없음
   */
  const startGuiding = (): void =>
    router.replace({
      params: { freeOnly: String(freeOnly), lat, lng, walkMinutes: String(walkMinutes) },
      pathname: '/session',
    });

  return (
    <View style={styles.screen}>
      <SheetHeader title="목적지" />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.address}>{address}</Text>

      <View style={styles.map}>
        <KakaoMap
          keyword=""
          nearby={{ ...center, radius: radiusMetersFromWalkMinutes(walkMinutes) }}
          pins={[{ id: 'destination', ...center, primary: true }]}
          onEvent={handleMapEvent}
        />
      </View>

      <BuildingNotice state={building} />

      <Text style={styles.sectionTitle}>반경</Text>
      <View style={styles.presetRow}>
        {RADIUS_PRESETS.map((preset) => {
          const isOn = preset === walkMinutes;
          return (
            <Pressable
              key={preset}
              style={[styles.preset, isOn && styles.presetOn]}
              onPress={(): void => setWalkMinutes(preset)}
            >
              <Text style={[styles.presetText, isOn && styles.presetTextOn]}>도보 {preset}분</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>무료 주차장만</Text>
        <Switch value={freeOnly} onValueChange={setFreeOnly} />
      </View>

      <CandidateCount count={candidates.length} error={error} isLoading={isLoading} />

      <DriveButton label="안내 시작" onPress={startGuiding} />
    </View>
  );
};

export default DestinationSheet;
