import { router, useLocalSearchParams } from 'expo-router';
import { Building2, CircleParking } from 'lucide-react-native';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KakaoMap } from '@/components/kakao-map';
import { SheetHeader } from '@/components/sheet-header';
import { RadiusPicker } from '@/components/radius-picker';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Typo } from '@/components/ui/typo';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { BuildingParkingState } from '@/hooks/use-building-parking';
import { useBuildingParking } from '@/hooks/use-building-parking';
import { useCandidateRadius } from '@/hooks/use-candidate-radius';
import { useCountUp } from '@/hooks/use-count-up';
import { radiusMetersFromWalkMinutes } from '@/utils/distance';

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  badgeOk: { backgroundColor: Colors.successSoft },
  badgeWarn: { backgroundColor: Colors.warnSoft },
  content: { gap: Spacing.xl, paddingBottom: Spacing.xxl },
  count: { gap: Spacing.md },
  countRow: { alignItems: 'baseline', flexDirection: 'row', gap: Spacing.xs },
  footer: { paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  map: { borderRadius: Radius.lg, height: 160, overflow: 'hidden' },
  // 지도가 뜰 때까지 같은 자리를 덮는다. 지도 타일이 오기 전엔 회색 빈칸이 갑자기 튀어나온다
  mapSkeleton: {
    borderRadius: Radius.lg,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  screen: { backgroundColor: Colors.surface, flex: 1, paddingHorizontal: Spacing.xl },
  title: { gap: Spacing.xs },
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
    return (
      <View style={styles.badge}>
        <Building2 color={Colors.muted} size={18} />
        <Typo tone="muted" variant="caption">
          건물 주차장 확인 중…
        </Typo>
      </View>
    );
  }
  if (error !== '' || parking === null) {
    return (
      <View style={styles.badge}>
        <Building2 color={Colors.muted} size={18} />
        <Typo tone="secondary" variant="caption">
          건물 주차장 정보 없음
        </Typo>
      </View>
    );
  }
  if (parking.totalSpaces === 0) {
    return (
      <View style={[styles.badge, styles.badgeWarn]}>
        <Building2 color={Colors.warn} size={18} />
        <Typo tone="warn" variant="bodyStrong">
          이 건물엔 주차장이 없어요
        </Typo>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeOk]}>
      <CircleParking color={Colors.success} size={18} />
      <Typo variant="bodyStrong">이 건물에 주차장이 있어요 · {parking.totalSpaces}면</Typo>
    </View>
  );
};

/**
 * 후보 수 한 줄. 숫자는 늘 그 자리에 있고, 조회가 끝나면 새 값까지 굴러간다.
 * 조회 중이라고 문구를 바꾸면 줄이 흔들리고 버튼도 같이 깜빡인다. 없음 배지도 정착된 값만 본다.
 * @param props 정착된 후보 수(첫 조회 전 null), 오류
 * @returns 후보 수 문구
 */
const CandidateCount = ({ count, error }: { count: number | null; error: string }): JSX.Element => {
  const shown = useCountUp(count ?? 0);
  return (
    <View style={styles.count}>
      <View style={styles.countRow}>
        <Typo tone="brand" variant="display">
          {shown}
        </Typo>
        <Typo tone="secondary" variant="body">
          곳을 후보로 준비했어요
        </Typo>
      </View>
      {error !== '' && (
        <Typo tone="muted" variant="caption">
          {error}
        </Typo>
      )}
      {error === '' && count === 0 && shown === 0 && (
        <View style={[styles.badge, styles.badgeWarn]}>
          <Typo tone="warn" variant="caption">
            반경 안에 주차장이 없어요
          </Typo>
        </View>
      )}
    </View>
  );
};

/**
 * 목적지 확인 시트. 반경과 무료 여부만 고르게 하고 후보 수를 먼저 알린다.
 * @returns 목적지 시트
 */
const DestinationSheet = (): JSX.Element => {
  const params = useLocalSearchParams<{
    name?: string;
    address?: string;
    lat?: string;
    lng?: string;
  }>();
  const [freeOnly, setFreeOnly] = useState(false);
  const { name = '목적지', address = '', lat = '', lng = '' } = params;

  const center = { lat: Number(lat), lng: Number(lng) };
  const building = useBuildingParking(address);
  const buildingSpaces = building.parking?.totalSpaces ?? 0;
  const { walkMinutes, pickWalkMinutes, count, error, isMapReady, handleMapEvent } =
    useCandidateRadius({ ...center, freeOnly, buildingSpaces });

  /**
   * 후보를 들고 안내 화면으로. 같은 조건으로 다시 조회하도록 파라미터를 넘긴다.
   * 쌓아 올려야(push) 안내 화면 뒤로가기가 이 화면으로 돌아온다.
   * @returns 없음
   */
  const startGuiding = (): void =>
    router.push({
      params: {
        buildingSpaces: String(buildingSpaces),
        freeOnly: String(freeOnly),
        lat,
        lng,
        name,
        walkMinutes: String(walkMinutes),
      },
      pathname: '/session',
    });

  // 모달은 안드로이드에서 전체 화면이라 상태 바와 내비게이션 바를 직접 피해야 한다
  return (
    <SafeAreaView style={styles.screen}>
      <SheetHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.title}>
          <Typo variant="display">{name}</Typo>
          <Typo tone="secondary" variant="caption">
            {address}
          </Typo>
        </View>

        <View style={styles.map}>
          <KakaoMap
            keyword=""
            nearby={{ ...center, radius: radiusMetersFromWalkMinutes(walkMinutes) }}
            pins={[{ id: 'destination', ...center, kind: 'place', primary: true }]}
            onEvent={handleMapEvent}
          />
          {!isMapReady && <Skeleton style={styles.mapSkeleton} />}
        </View>

        <BuildingNotice state={building} />

        <RadiusPicker
          freeOnly={freeOnly}
          walkMinutes={walkMinutes}
          onChangeFreeOnly={setFreeOnly}
          onChangeWalkMinutes={pickWalkMinutes}
        />

        <CandidateCount count={count} error={error} />
      </ScrollView>

      <View style={styles.footer}>
        <Button disabled={!count} label="안내 시작" size="drive" onPress={startGuiding} />
      </View>
    </SafeAreaView>
  );
};

export default DestinationSheet;
