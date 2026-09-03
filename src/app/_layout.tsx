import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { JSX } from 'react';

/**
 * 앱 루트 레이아웃. 안내 흐름은 스택 하나로 두고 시트만 모달로 띄운다.
 *
 * expo-router가 라우트 파일에 default export를 강제해서 여기만 예외다.
 * @returns 루트 내비게이션 트리
 */
const RootLayout = (): JSX.Element => (
  <>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="session" />
      <Stack.Screen name="parked" />
      <Stack.Screen name="destination" options={{ presentation: 'modal' }} />
      <Stack.Screen name="candidates" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
    </Stack>
    <StatusBar style="auto" />
  </>
);

export default RootLayout;
