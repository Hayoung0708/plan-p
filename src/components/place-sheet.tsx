import { router } from 'expo-router';
import { ChevronRight, MapPin, Search } from 'lucide-react-native';
import type { JSX } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typo } from '@/components/ui/typo';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/constants/category-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { MapPlace } from '@/utils/kakao-map-html';

export type PlaceSheetProps = {
  /** 검색 결과. 카카오 약관상 저장할 수 없어 화면 상태로만 들고 있다 */
  places: MapPlace[];
  /** 확정된 검색어. 비어 있으면 아직 검색 전이다 */
  keyword: string;
  /** 스크롤 위치(px). 헤더가 시트 윗변이 닿았는지 판단하는 데 쓴다 */
  scrollY: SharedValue<number>;
  /** 접힌 시트 위로 보이는 지도 높이(px). 시트가 처음 놓이는 자리다 */
  mapHeight: number;
  /** 접힌 시트 높이(px). 결과가 있을 때와 없을 때가 다르다 */
  sheetHeight: number;
};

const styles = StyleSheet.create({
  // 시트 윗변 위쪽을 잘라내는 틀. 틀 밖(지도)에 닿은 터치는 스크롤뷰가 아니라 뒤의 지도로 간다
  clip: { bottom: 0, left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0 },
  emptyBox: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.pill,
    height: 56,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    width: 56,
  },
  // 마지막 행이 바닥에 딱 붙지 않을 만큼만. 행 사이 간격(24)의 절반
  list: { paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: Spacing.sm },
  pin: {
    alignItems: 'center',
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  // 높이는 틀과 같게 고정한다. bottom: 0으로 두면 top을 올릴 때 높이가 같이 늘어 끝까지 스크롤이 안 된다
  scroll: { height: '100%', left: 0, position: 'absolute', right: 0 },
  row: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  rowBody: { flex: 1, gap: 2 },
  rowName: { flexShrink: 1 },
  rowPressed: { backgroundColor: Colors.surfaceAlt },
  // 시트 본체. 스크롤 콘텐츠라서 위로 밀면 화면 밖까지 그대로 올라간다
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  titleRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xl,
  },
});

/**
 * 검색 전 안내. 이 앱이 무엇을 대신해주는지 한 줄로 말한다.
 * @returns 빈 상태 뷰
 */
const EmptyState = (): JSX.Element => (
  <>
    <View style={styles.emptyIcon}>
      <Search color={Colors.brand} size={24} strokeWidth={2.5} />
    </View>
    <Typo variant="heading">어디로 가세요?</Typo>
    <Typo style={{ textAlign: 'center' }} tone="secondary" variant="caption">
      목적지를 검색하면 주변 주차장을{'\n'}후보로 한 번에 잡아둡니다.
    </Typo>
  </>
);

/**
 * 검색했는데 아무것도 못 찾았을 때.
 * @param props 실패한 검색어
 * @returns 빈 결과 안내
 */
const NoResult = ({ keyword }: { keyword: string }): JSX.Element => (
  <>
    <View style={styles.emptyIcon}>
      <MapPin color={Colors.muted} size={24} />
    </View>
    <Typo variant="heading">결과가 없어요</Typo>
    <Typo tone="secondary" variant="caption">{`'${keyword}'로 찾지 못했습니다`}</Typo>
  </>
);

/**
 * 결과 한 줄. 카테고리 아이콘, 이름, 주소.
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
        <Icon color={Colors.brand} size={20} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.nameRow}>
          <Typo numberOfLines={1} style={styles.rowName} variant="bodyStrong">
            {name}
          </Typo>
          {category !== '' && (
            <Typo numberOfLines={1} tone="muted" variant="label">
              {category}
            </Typo>
          )}
        </View>
        <Typo numberOfLines={1} tone="secondary" variant="caption">
          {address}
        </Typo>
      </View>
      <ChevronRight color={Colors.muted} size={18} />
    </Pressable>
  );
};

/**
 * 검색 결과 시트.
 *
 * 시트 안에 스크롤을 두지 않는다. 화면 전체를 덮는 스크롤 하나에 위쪽 투명 여백을 두고 그 아래 시트를 붙여서,
 * 스크롤하면 시트 자체가 한 장처럼 위로 밀려 올라간다. 목록이 길면 시트가 화면 위를 지나 계속 올라간다.
 *
 * 스크롤뷰는 시트 윗변에서 시작하는 틀 안에 넣는다. 네이티브 스크롤뷰는 자기 영역의 터치를 전부 가져가서,
 * 화면 전체로 두면 지도를 만질 수 없고 pointerEvents로 비켜 주면 스크롤이 죽는다.
 * @param props 검색 결과, 검색어, 스크롤 위치, 지도·시트 높이
 * @returns 하단 시트
 */
export const PlaceSheet = ({
  places,
  keyword,
  scrollY,
  mapHeight,
  sheetHeight,
}: PlaceSheetProps): JSX.Element => {
  const hasResults = places.length > 0;
  // 시트 바닥은 화면 끝까지 내려가고, 내용만 시스템 내비게이션 바 위에 놓는다
  const { bottom } = useSafeAreaInsets();

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  // 틀은 시트 윗변까지 내리고 스크롤뷰는 그만큼 되올려서 화면에서는 스크롤뷰가 제자리에 있고 틀만 움직인다.
  // 스크롤뷰 자체를 움직이면 손가락 좌표가 매 프레임 어긋나 스크롤이 더듬거린다.
  // 스크롤뷰 쪽은 transform이 아니라 top이어야 한다. RN이 스크롤뷰의 transform을 measure에 두 번 반영해서
  // 눌린 자리가 실제와 어긋나고, 그러면 Pressable이 손가락이 벗어났다고 보고 탭을 버린다
  const clipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(mapHeight - scrollY.value, 0) }],
  }));
  const scrollStyle = useAnimatedStyle(() => ({
    top: -Math.max(mapHeight - scrollY.value, 0),
  }));

  return (
    <Animated.View style={[styles.clip, clipStyle]}>
      <Animated.ScrollView
        scrollEnabled={hasResults}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={[styles.scroll, scrollStyle]}
        onScroll={handleScroll}
      >
        <View style={{ height: mapHeight }} />
        <View style={[styles.sheet, { minHeight: sheetHeight + bottom, paddingBottom: bottom }]}>
          {hasResults ? (
            <View style={styles.list}>
              <View style={styles.titleRow}>
                <Typo variant="heading">검색 결과</Typo>
                <Typo tone="brand" variant="heading">
                  {places.length}
                </Typo>
              </View>
              {places.map((place) => (
                <PlaceRow key={place.id} place={place} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              {keyword === '' ? <EmptyState /> : <NoResult keyword={keyword} />}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};
