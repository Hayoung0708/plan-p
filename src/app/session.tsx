import { router, useLocalSearchParams } from 'expo-router';
import type { JSX } from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CandidatesSheet } from '@/components/candidates-sheet';
import { LotCard } from '@/components/lot-card';
import { SessionHeader } from '@/components/session-header';
import { SessionMap } from '@/components/session-map';
import { Colors, Spacing } from '@/constants/theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useKakaoNearby } from '@/hooks/use-kakao-nearby';
import { useNearbyLots } from '@/hooks/use-nearby-lots';
import type { NearbyLot } from '@/types/parking';
import { radiusMetersFromWalkMinutes } from '@/utils/distance';
import { distanceMeters, mergeLots } from '@/utils/merge-lots';
import { buildRoute } from '@/utils/queue';

const styles = StyleSheet.create({
  done: { color: Colors.muted, fontSize: 15, paddingVertical: Spacing.md, textAlign: 'center' },
  map: { flex: 1 },
  notice: { color: Colors.muted, fontSize: 15, padding: Spacing.xl, textAlign: 'center' },
  screen: { backgroundColor: Colors.background, flex: 1 },
});

/**
 * 후보가 없을 때 뜨는 안내. 찾는 중인지 없는 건지 구분해 준다.
 * @param props 로딩 여부와 오류
 * @returns 안내 문구
 */
const EmptyNotice = ({ isLoading, error }: { isLoading: boolean; error: string }): JSX.Element => {
  if (isLoading) {
    return <Text style={styles.notice}>후보 찾는 중…</Text>;
  }
  return <Text style={styles.notice}>{error !== '' ? error : '반경 안에 주차장이 없습니다'}</Text>;
};

type GuideBodyProps = {
  lot: NearbyLot | undefined;
  remaining: number;
  isLoading: boolean;
  error: string;
  onFull: () => void;
  onParked: () => void;
};

/**
 * 화면 하단. 후보가 있으면 안내 카드를, 없으면 이유를 보여 준다.
 * @param props 현재 후보와 조회 상태, 버튼 처리
 * @returns 하단 영역
 */
const GuideBody = ({
  lot,
  remaining,
  isLoading,
  error,
  onFull,
  onParked,
}: GuideBodyProps): JSX.Element => {
  if (lot === undefined) {
    return <EmptyNotice error={error} isLoading={isLoading} />;
  }
  return (
    <View>
      <LotCard lot={lot} remaining={remaining} onFull={onFull} />
      <Pressable onPress={onParked}>
        <Text style={styles.done}>주차 완료</Text>
      </Pressable>
    </View>
  );
};

/**
 * 안내 화면. 화면에 목적지는 하나, 버튼도 하나다.
 * 후보 목록을 늘어놓으면 운전 중에 비교를 시작하게 되고, 그 비교가 앱이 할 일이다.
 * @returns 안내 화면
 */
const SessionScreen = (): JSX.Element => {
  const params = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    walkMinutes?: string;
    freeOnly?: string;
  }>();
  const [index, setIndex] = useState(0);
  const [isListOpen, setIsListOpen] = useState(false);
  const { lat = '', lng = '', walkMinutes = '10', freeOnly = 'false' } = params;

  const center = { lat: Number(lat), lng: Number(lng) };
  const nearby = { ...center, radius: radiusMetersFromWalkMinutes(Number(walkMinutes)) };
  const isFreeOnly = freeOnly === 'true';
  const { lots, isLoading, error } = useNearbyLots({
    ...center,
    walkMinutes: Number(walkMinutes),
    freeOnly: isFreeOnly,
  });
  // 공공데이터에 없는 민영은 지도에서 조회해 화면에서만 합친다. 저장하지 않는다.
  // 무료만 보기일 때는 요금을 모르는 민영을 섞으면 조건이 깨진다
  const { lots: kakaoLots, handleMapEvent } = useKakaoNearby(center, distanceMeters);
  // 지금 있는 곳에서 가까운 순으로 세워야 되돌아가는 동선이 안 생긴다.
  // 위치 권한이 없으면 목적지를 기준점으로 쓴다
  const { location } = useCurrentLocation();
  const candidates = buildRoute(isFreeOnly ? lots : mergeLots(lots, kakaoLots), location ?? center);

  const current = candidates[index];
  const remaining = Math.max(candidates.length - index - 1, 0);

  /** 만차 신고 겸 다음 후보 전환. 후보가 없으면 반경을 넓히자고 제안한다 */
  const handleFull = (): void => {
    if (remaining === 0) {
      Alert.alert('후보를 다 돌았어요', '반경을 넓혀서 다시 찾을까요?');
      return;
    }
    setIndex(index + 1);
  };

  /**
   * 주차 완료. 세션을 끝내고 주차한 곳을 넘긴다.
   * @returns 없음
   */
  const handleParked = (): void =>
    router.replace({ params: { name: current?.name ?? '' }, pathname: '/parked' });

  return (
    <SafeAreaView style={styles.screen}>
      <SessionHeader remaining={remaining} onPressCounter={(): void => setIsListOpen(true)} />

      <View style={styles.map}>
        <SessionMap
          candidates={candidates}
          index={index}
          location={location}
          nearby={nearby}
          onEvent={handleMapEvent}
        />
      </View>

      <GuideBody
        error={error}
        isLoading={isLoading}
        lot={current}
        remaining={remaining}
        onFull={handleFull}
        onParked={handleParked}
      />

      <CandidatesSheet
        isVisible={isListOpen}
        lots={candidates.slice(index + 1)}
        onClose={(): void => setIsListOpen(false)}
      />
    </SafeAreaView>
  );
};

export default SessionScreen;
