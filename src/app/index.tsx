import { Search } from 'lucide-react';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KakaoMap } from '@/components/kakao-map';
import { LocateButton } from '@/components/locate-button';
import { PlaceSheet } from '@/components/place-sheet';
import { SHEET_HEIGHT } from '@/constants/parking';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import type { MapEvent, MapPlace } from '@/utils/kakao-map-html';

const styles = StyleSheet.create({
  // 검색창은 지도 위에 떠 있는 카드다. 지도가 화면 끝까지 이어져 보여야 넓게 느껴진다
  header: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    elevation: 4,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerLayer: { left: 0, position: 'absolute', right: 0, top: 0 },
  // 시트 바로 위 오른쪽. 지도를 가리지 않으면서 엄지에 닿는 자리다
  locateLayer: { bottom: SHEET_HEIGHT + Spacing.md, position: 'absolute', right: Spacing.lg },
  screen: { backgroundColor: Colors.background, flex: 1, overflow: 'hidden' },
  searchBox: { color: Colors.text, flex: 1, fontSize: 16, paddingVertical: Spacing.md },
  searchButton: { paddingHorizontal: Spacing.xs, paddingVertical: Spacing.sm },
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
    <View style={styles.screen}>
      {/* 지도는 화면 전체를 채우고, 검색창·시트가 그 위에 뜬다 */}
      <View style={StyleSheet.absoluteFill}>
        <KakaoMap keyword={keyword} myLocation={location} onEvent={handleMapEvent} />
      </View>

      <SafeAreaView edges={['top']} style={styles.headerLayer}>
        <View style={styles.header}>
          <TextInput
            placeholder="어디로 가세요?"
            placeholderTextColor={Colors.muted}
            returnKeyType="search"
            style={styles.searchBox}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
          />
          <Pressable style={styles.searchButton} onPress={handleSearch}>
            <Search color={Colors.muted} size={20} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.locateLayer}>
        <LocateButton isDenied={isDenied} isLoading={isLoading} onPress={request} />
      </View>

      <PlaceSheet keyword={keyword} places={places} />
    </View>
  );
};

export default HomeScreen;
