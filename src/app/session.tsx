import { router } from 'expo-router';
import { ArrowLeft, ExternalLink, Settings } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DriveButton } from '@/components/drive-button';
import { MapPlaceholder } from '@/components/map-placeholder';
import { CANDIDATE_QUEUE, LOW_CANDIDATE_THRESHOLD } from '@/constants/mock';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatAvailability, formatFee, formatRemaining } from '@/utils/format';

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    color: Colors.warn,
    fontSize: 14,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  card: { padding: Spacing.lg },
  counter: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  detail: { color: Colors.muted, fontSize: 15, marginTop: Spacing.xs },
  done: {
    color: Colors.muted,
    fontSize: 15,
    paddingVertical: Spacing.md,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  lotName: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  navLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  navLinkText: { color: Colors.brand, fontSize: 16, fontWeight: '600' },
  screen: { backgroundColor: Colors.background, flex: 1 },
});

/**
 * 안내 화면. 화면에 목적지는 하나, 버튼도 하나다.
 * 후보 목록을 늘어놓으면 운전 중에 비교를 시작하게 되고, 그 비교가 앱이 할 일이다.
 * @returns 안내 화면
 */
const SessionScreen = (): JSX.Element => {
  const [index, setIndex] = useState(0);
  const current = CANDIDATE_QUEUE[index];
  const remaining = CANDIDATE_QUEUE.length - index - 1;

  /** 만차 신고 겸 다음 후보 전환. 후보가 없으면 반경을 넓히자고 제안한다 */
  const handleFull = (): void => {
    if (remaining === 0) {
      Alert.alert('후보를 다 돌았어요', '반경을 넓혀서 다시 찾을까요?');
      return;
    }
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={(): void => router.replace('/')}>
          <ArrowLeft color={Colors.muted} size={22} />
        </Pressable>
        <Pressable onPress={(): void => router.push('/candidates')}>
          <Text style={styles.counter}>{formatRemaining(remaining)}</Text>
        </Pressable>
        <Pressable onPress={(): void => router.push('/settings')}>
          <Settings color={Colors.muted} size={22} />
        </Pressable>
      </View>

      <MapPlaceholder remaining={remaining} />

      <View style={styles.card}>
        {remaining <= LOW_CANDIDATE_THRESHOLD && (
          <Text style={styles.banner}>후보가 {remaining}곳 남았어요 · 반경 넓히기</Text>
        )}
        <Text style={styles.lotName}>{current.name}</Text>
        <Text style={styles.detail}>
          도보 {current.walkMinutes}분 · 차로 {current.driveMinutes}분 ·{' '}
          {formatFee(current.hourlyFee)}
        </Text>
        <Text style={styles.detail}>{formatAvailability(current.availability)}</Text>

        <View style={styles.navLink}>
          <ExternalLink color={Colors.brand} size={18} />
          <Text style={styles.navLinkText}>내비로 열기</Text>
        </View>

        <DriveButton label="만차예요" onPress={handleFull} />
        <Pressable onPress={(): void => router.replace('/parked')}>
          <Text style={styles.done}>주차 완료</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SessionScreen;
