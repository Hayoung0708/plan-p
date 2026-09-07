import { Search } from 'lucide-react-native';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KakaoMap } from '@/components/kakao-map';
import { LocateButton } from '@/components/locate-button';
import { PlaceSheet } from '@/components/place-sheet';
import { HOME_HEADER_HEIGHT } from '@/constants/parking';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useHomeLayout } from '@/hooks/use-home-layout';
import { useHomeScrollStyles } from '@/hooks/use-home-scroll-styles';
import type { MapEvent, MapPlace } from '@/utils/kakao-map-html';

const styles = StyleSheet.create({
  // 검색창은 지도 위에 떠 있는 알약이다. 지도가 화면 끝까지 이어져 보여야 넓게 느껴진다
  header: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    // 테두리 폭은 항상 두고 색만 바꾼다. 폭이 바뀌면 붙는 순간 알약이 1px 커져 보인다
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    height: HOME_HEADER_HEIGHT - Spacing.md * 2,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.xs,
  },
  // 시트가 끝까지 올라오면 지도 대신 흰 바탕과 밑선을 깔아 시트가 그 아래로 들어간 것처럼 보이게 한다
  headerLayer: {
    borderBottomColor: Colors.border,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  // 접힌 시트 바로 위에 고정. 시트가 올라오면 가려지지만 그때는 목록을 보는 중이다
  locateLayer: { position: 'absolute', right: Spacing.lg },
  screen: { backgroundColor: Colors.background, flex: 1, overflow: 'hidden' },
  searchBox: { ...Typography.body, color: Colors.text, flex: 1 },
  searchButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    width: 44,
  },
});

/**
 * 홈 화면. 지도가 화면 전체를 채우고 검색창과 결과 시트가 그 위에 뜬다.
 *
 * 검색은 지도(웹뷰) 안의 카카오 services 라이브러리가 처리하고 결과만 올려받는다.
 * @returns 홈 화면
 */
const HomeScreen = (): JSX.Element => {
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<MapPlace[]>([]);
  // 홈에서는 자동으로 묻지 않는다. 버튼을 눌렀을 때만 권한을 요청한다
  const { location, isLoading, isDenied, request } = useCurrentLocation({ auto: false });

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const { sheetHeight, mapHeight, dockAt, onLayout } = useHomeLayout(places.length > 0);
  const { headerStyle, pillStyle, locateStyle } = useHomeScrollStyles(scrollY, dockAt);

  const handleMapEvent = useCallback((event: MapEvent): void => {
    if (event.type === 'results') {
      setPlaces(event.places);
    }
  }, []);

  /**
   * 검색 실행. 타이핑마다 부르면 쿼터를 태우니 엔터나 아이콘에서만 부른다.
   * @returns 없음
   */
  const handleSearch = (): void => setKeyword(input.trim());

  return (
    <View style={styles.screen} onLayout={onLayout}>
      {/* 지도는 화면 전체를 채우고, 시트·검색창이 그 위에 뜬다 */}
      <View style={StyleSheet.absoluteFill}>
        <KakaoMap keyword={keyword} myLocation={location} onEvent={handleMapEvent} />
      </View>

      <PlaceSheet
        keyword={keyword}
        mapHeight={mapHeight}
        places={places}
        scrollY={scrollY}
        sheetHeight={sheetHeight}
      />

      <Animated.View style={[styles.headerLayer, { paddingTop: insets.top }, headerStyle]}>
        <Animated.View style={[styles.header, pillStyle]}>
          <TextInput
            placeholder="어디로 가세요?"
            placeholderTextColor={Colors.muted}
            returnKeyType="search"
            style={styles.searchBox}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
          />
          <Pressable accessibilityLabel="검색" style={styles.searchButton} onPress={handleSearch}>
            <Search color={Colors.brand} size={22} strokeWidth={2.5} />
          </Pressable>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.locateLayer,
          { bottom: sheetHeight + insets.bottom + Spacing.lg },
          locateStyle,
        ]}
      >
        <LocateButton isDenied={isDenied} isLoading={isLoading} onPress={request} />
      </Animated.View>
    </View>
  );
};

export default HomeScreen;
