import { router, useLocalSearchParams } from 'expo-router';
import { CircleParking } from 'lucide-react-native';
import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DriveButton } from '@/components/drive-button';
import { Colors, Radius, Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  footer: { padding: Spacing.xl },
  name: { color: Colors.text, fontSize: 24, fontWeight: '700', marginTop: Spacing.md },
  saved: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    color: Colors.text,
    fontSize: 14,
    marginTop: Spacing.xl,
    padding: Spacing.md,
  },
  screen: { backgroundColor: Colors.background, flex: 1 },
});

/**
 * 주차 완료 화면. 세션을 끝내고 주차 위치를 남긴다.
 * @returns 주차 완료 화면
 */
const ParkedScreen = (): JSX.Element => {
  const { name = '주차장' } = useLocalSearchParams<{ name?: string }>();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <CircleParking color={Colors.brand} size={44} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.saved}>주차 위치와 시각을 저장했어요</Text>
      </View>
      <View style={styles.footer}>
        <DriveButton label="홈으로" tone="muted" onPress={(): void => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
};

export default ParkedScreen;
