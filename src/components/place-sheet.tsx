import { router } from 'expo-router';
import { ChevronRight, MapPin, Search } from 'lucide-react-native';

import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/constants/category-icons';
import type { JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SHEET_HEIGHT } from '@/constants/parking';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { MapPlace } from '@/utils/kakao-map-html';

export type PlaceSheetProps = {
  /** 검색 결과. 카카오 약관상 저장할 수 없어 화면 상태로만 들고 있다 */
  places: MapPlace[];
  /** 확정된 검색어. 비어 있으면 아직 검색 전이다 */
  keyword: string;
};

const styles = StyleSheet.create({
  address: { color: Colors.muted, fontSize: 13, marginTop: 3 },
  category: { color: Colors.muted, flexShrink: 0, fontSize: 12 },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: Spacing.sm },

  count: { color: Colors.brand, fontSize: 15, fontWeight: '700' },
  emptyBody: { color: Colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  emptyBox: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    width: 48,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: Colors.border,
    borderRadius: 3,
    height: 5,
    marginBottom: Spacing.md,
    width: 40,
  },
  // 아이콘 폭만큼 들여 구분선이 글자 라인에 맞게 떨어진다
  list: { paddingBottom: Spacing.xl },
  pin: {
    alignItems: 'center',
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowBody: { flex: 1 },
  rowName: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  rowNameFlex: { flexShrink: 1 },
  rowPressed: { backgroundColor: Colors.surface },
  separator: {
    backgroundColor: Colors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  // 지도 위에 고정. 지도는 시트 뒤까지 그려져 화면 전체를 채운다
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    elevation: 8,
    height: SHEET_HEIGHT,
    left: 0,
    paddingTop: Spacing.sm,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  titleText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
});

/**
 * 검색 전 안내. 이 앱이 무엇을 대신해주는지 한 줄로 말한다.
 * @returns 빈 상태 뷰
 */
const EmptyState = (): JSX.Element => (
  <View style={styles.emptyBox}>
    <View style={styles.emptyIcon}>
      <Search color={Colors.muted} size={22} />
    </View>
    <Text style={styles.emptyTitle}>어디로 가세요?</Text>
    <Text style={styles.emptyBody}>
      목적지를 검색하면 주변 주차장을{'\n'}후보로 한 번에 잡아둡니다.
    </Text>
  </View>
);

/**
 * 결과 한 줄. 이름 아래에 카테고리와 주소를 붙인다.
 * @param props 장소 하나
 * @returns 목록 행
 */
const PlaceRow = ({ place }: { place: MapPlace }): JSX.Element => {
  const { name, address, category, categoryCode, lat, lng } = place;
  const Icon = CATEGORY_ICONS[categoryCode] ?? DEFAULT_CATEGORY_ICON;
  return (
    <Pressable
      style={({ pressed }): (object | false)[] => [styles.row, pressed && styles.rowPressed]}
      onPress={(): void =>
        router.push({
          params: { address, lat: String(lat), lng: String(lng), name },
          pathname: '/destination',
        })
      }
    >
      <View style={styles.pin}>
        <Icon color={Colors.brand} size={18} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[styles.rowName, styles.rowNameFlex]}>
            {name}
          </Text>
          {category !== '' && (
            <Text numberOfLines={1} style={styles.category}>
              {category}
            </Text>
          )}
        </View>
        <Text numberOfLines={1} style={styles.address}>
          {address}
        </Text>
      </View>
      <ChevronRight color={Colors.border} size={20} />
    </Pressable>
  );
};

/**
 * 검색 결과 시트. 결과는 목록으로, 검색 전에는 안내 문구로 채운다.
 * @param props 검색 결과와 검색어
 * @returns 하단 고정 시트
 */
export const PlaceSheet = ({ places, keyword }: PlaceSheetProps): JSX.Element => {
  const hasResults = places.length > 0;
  const isSearched = keyword !== '';

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      {hasResults && (
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>검색 결과</Text>
          <Text style={styles.count}>{places.length}</Text>
        </View>
      )}

      {!hasResults && !isSearched && <EmptyState />}

      {!hasResults && isSearched && (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <MapPin color={Colors.muted} size={22} />
          </View>
          <Text style={styles.emptyTitle}>결과가 없어요</Text>
          <Text
            style={styles.emptyBody}
          >{`'${keyword}'로 찾지 못했습니다. 다르게 적어보세요.`}</Text>
        </View>
      )}

      {hasResults && (
        <ScrollView
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {places.map((place, index) => (
            <View key={place.id}>
              {index > 0 && <View style={styles.separator} />}
              <PlaceRow place={place} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
