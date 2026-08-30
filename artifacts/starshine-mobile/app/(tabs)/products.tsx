import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { ProductCard } from '@/components/ProductCard';
import { PRODUCTS } from '@/constants/products';

interface Section {
  title: string;
  data: typeof PRODUCTS;
}

/** Map slug from Home category cards → product category name */
const CATEGORY_SLUG_MAP: Record<string, string> = {
  'gear-reducers': 'Gear Reducers',
  'planetary': 'Planetary',
  'servo': 'Servo & Precision',
  'geared-motors': 'Geared Motors',
};

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();

  const [search, setSearch] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  // Category pre-filter from Home tab navigation
  const categoryFilter =
    params.category && CATEGORY_SLUG_MAP[params.category]
      ? CATEGORY_SLUG_MAP[params.category]
      : null;

  const sections: Section[] = useMemo(() => {
    const query = search.toLowerCase().trim();
    const filtered = PRODUCTS.filter((p) => {
      const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
      const matchesSearch = query
        ? p.name.toLowerCase().includes(query) ||
          p.series.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.shortDesc.toLowerCase().includes(query)
        : true;
      return matchesCategory && matchesSearch;
    });

    const categoryMap = new Map<string, typeof PRODUCTS>();
    for (const product of filtered) {
      const list = categoryMap.get(product.category) ?? [];
      list.push(product);
      categoryMap.set(product.category, list);
    }

    const order = ['Gear Reducers', 'Planetary', 'Servo & Precision', 'Geared Motors'];
    return order
      .filter((cat) => categoryMap.has(cat))
      .map((cat) => ({ title: cat, data: categoryMap.get(cat)! }));
  }, [search, categoryFilter]);

  function handleProductPress(productId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${productId}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
          Products
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
          {PRODUCTS.length} industrial drive solutions
        </Text>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: 'IBMPlexSans_400Regular' }]}
            placeholder="Search products, series…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
            testID="products-search"
          />
          {search.length > 0 && Platform.OS !== 'ios' && (
            <Pressable onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_600SemiBold' }]}>
              {section.title.toUpperCase()}
            </Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
              {section.data.length}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_600SemiBold' }]}>
              No products found
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
              Try a different search term
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100 },
        ]}
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 18,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 12,
  },
  listContent: {
    paddingTop: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
  },
});
