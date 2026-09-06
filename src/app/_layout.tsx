import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { JSX } from 'react';
import { useEffect } from 'react';

import { Fonts } from '@/constants/theme';

// 글꼴이 오기 전에 화면을 그리면 시스템 글꼴로 한 번 깜빡인다. 스플래시를 잡아 둔다
SplashScreen.preventAutoHideAsync();

const FONT_FILES = {
  [Fonts.medium]: require('../../assets/fonts/Pretendard-Medium.otf'),
  [Fonts.bold]: require('../../assets/fonts/Pretendard-Bold.otf'),
  [Fonts.extraBold]: require('../../assets/fonts/Pretendard-ExtraBold.otf'),
  [Fonts.displayBold]: require('../../assets/fonts/SUIT-Bold.otf'),
  [Fonts.displayExtraBold]: require('../../assets/fonts/SUIT-ExtraBold.otf'),
};

/**
 * 앱 루트 레이아웃. 글꼴을 먼저 올리고, 안내 흐름은 스택 하나로 두고 시트만 모달로 띄운다.
 *
 * expo-router가 라우트 파일에 default export를 강제해서 여기만 예외다.
 * @returns 루트 내비게이션 트리. 글꼴이 준비되기 전엔 null
 */
const RootLayout = (): JSX.Element | null => {
  const [isFontReady, fontError] = useFonts(FONT_FILES);

  useEffect(() => {
    // 글꼴이 실패해도 앱은 떠야 한다. 시스템 글꼴로 떨어질 뿐이다
    if (isFontReady || fontError !== null) {
      SplashScreen.hideAsync();
    }
  }, [isFontReady, fontError]);

  if (!isFontReady && fontError === null) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="session" />
        <Stack.Screen name="parked" />
        <Stack.Screen name="destination" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
};

export default RootLayout;
