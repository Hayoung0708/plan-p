import { router, useLocalSearchParams } from 'expo-router';
import type { JSX } from 'react';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CandidatesSheet } from '@/components/candidates-sheet';
import { LotCard } from '@/components/lot-card';
import { SessionHeader } from '@/components/session-header';
import { SessionMap } from '@/components/session-map';
import { Card } from '@/components/ui/card';
import { Typo } from '@/components/ui/typo';
import { Colors, Spacing } from '@/constants/theme';
import type { SessionQueryInput } from '@/hooks/use-session-query';
import { useSessionQuery } from '@/hooks/use-session-query';
import type { NearbyLot } from '@/types/parking';

const styles = StyleSheet.create({
  // 카드는 지도 위에 떠 있다. 지도가 카드 뒤까지 이어져야 화면이 좁아 보이지 않는다
  cardLayer: { bottom: 0, left: 0, padding: Spacing.lg, position: 'absolute', right: 0 },
  notice: { alignItems: 'center' },
  screen: { backgroundColor: Colors.background, flex: 1 },
});

/**
 * 후보가 없을 때 뜨는 안내. 찾는 중인지 없는 건지 구분해 준다.
 * @param props 로딩 여부와 오류
 * @returns 안내 문구
 */
const EmptyNotice = ({ isLoading, error }: { isLoading: boolean; error: string }): JSX.Element => (
  <Card floating style={styles.notice}>
    <Typo tone="secondary" variant="body">
      {isLoading ? '후보 찾는 중…' : error !== '' ? error : '반경 안에 주차장이 없습니다'}
    </Typo>
  </Card>
);

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
  return <LotCard lot={lot} remaining={remaining} onFull={onFull} onParked={onParked} />;
};

/**
 * 안내 화면. 화면에 목적지는 하나, 버튼도 하나다.
 * 후보 목록을 늘어놓으면 운전 중에 비교를 시작하게 되고, 그 비교가 앱이 할 일이다.
 * @returns 안내 화면
 */
const SessionScreen = (): JSX.Element => {
  const params = useLocalSearchParams<SessionQueryInput>();
  const [index, setIndex] = useState(0);
  const [isListOpen, setIsListOpen] = useState(false);

  const { candidates, nearby, location, isLoading, error, handleMapEvent } =
    useSessionQuery(params);

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
    <View style={styles.screen}>
      <View style={StyleSheet.absoluteFill}>
        <SessionMap
          candidates={candidates}
          index={index}
          location={location}
          nearby={nearby}
          onEvent={handleMapEvent}
        />
      </View>

      <SafeAreaView edges={['top']}>
        <SessionHeader remaining={remaining} onPressCounter={(): void => setIsListOpen(true)} />
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.cardLayer}>
        <GuideBody
          error={error}
          isLoading={isLoading}
          lot={current}
          remaining={remaining}
          onFull={handleFull}
          onParked={handleParked}
        />
      </SafeAreaView>

      <CandidatesSheet
        isVisible={isListOpen}
        lots={candidates.slice(index + 1)}
        onClose={(): void => setIsListOpen(false)}
      />
    </View>
  );
};

export default SessionScreen;
