import { router, useLocalSearchParams } from 'expo-router';
import { CircleParking } from 'lucide-react-native';
import type { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Typo } from '@/components/ui/typo';
import { Colors, Radius, Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  footer: { padding: Spacing.xl },
  mark: {
    alignItems: 'center',
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.pill,
    height: 96,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    width: 96,
  },
  screen: { backgroundColor: Colors.surface, flex: 1 },
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
        <View style={styles.mark}>
          <CircleParking color={Colors.brand} size={48} strokeWidth={2.2} />
        </View>
        <Typo tone="muted" variant="label">
          주차 완료
        </Typo>
        <Typo style={{ textAlign: 'center' }} variant="display">
          {name}
        </Typo>
      </View>
      <View style={styles.footer}>
        <Button
          label="홈으로"
          size="drive"
          variant="secondary"
          onPress={(): void => router.dismissAll()}
        />
      </View>
    </SafeAreaView>
  );
};

export default ParkedScreen;
