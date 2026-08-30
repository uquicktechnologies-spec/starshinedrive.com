import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { CATEGORIES, PRODUCTS } from '@/constants/products';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const featuredProducts = PRODUCTS.slice(0, 4);

  function handleCategoryPress(categoryId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(tabs)/products', params: { category: categoryId } });
  }

  function handleProductPress(productId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${productId}`);
  }

  function handleQuotePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/quote');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero */}
      <LinearGradient
        colors={['#093C71', '#0A4D8C', '#093C71']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        {/* Header row */}
        <View style={styles.heroHeader}>
          <View style={styles.logoRow}>
            <View style={[styles.logoStar, { backgroundColor: '#EF6F24' }]}>
              <MaterialCommunityIcons name="star-four-points" size={14} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoText, { fontFamily: 'IBMPlexSans_700Bold' }]}>
              STARSHINE<Text style={{ color: '#EF6F24' }}> DRIVE</Text>
            </Text>
          </View>
          <Pressable
            style={[styles.contactBtn]}
            onPress={() => router.push('/(tabs)/contact')}
          >
            <Feather name="phone" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

        {/* Tagline */}
        <View style={styles.heroBody}>
          <Text style={[styles.heroLabel, { fontFamily: 'IBMPlexSans_500Medium' }]}>
            PRECISION POWER TRANSMISSION
          </Text>
          <Text style={[styles.heroTitle, { fontFamily: 'IBMPlexSans_700Bold' }]}>
            Industrial{'\n'}Gear Solutions
          </Text>
          <Text style={[styles.heroSub, { fontFamily: 'IBMPlexSans_400Regular' }]}>
            Helical · Worm · Planetary · Servo gearboxes for every industrial application
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.heroBtn,
              { backgroundColor: '#EF6F24', opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleQuotePress}
          >
            <Text style={[styles.heroBtnText, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
              Request a Quote
            </Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          {[
            { value: '20+', label: 'Years' },
            { value: '8', label: 'Product Lines' },
            { value: '50+', label: 'Countries' },
            { value: 'IP65', label: 'Protection' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statValue, { fontFamily: 'IBMPlexSans_700Bold' }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { fontFamily: 'IBMPlexSans_400Regular' }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
            Browse by Category
          </Text>
        </View>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.categoryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => handleCategoryPress(cat.id)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '12' }]}>
                <MaterialCommunityIcons
                  name={cat.iconName as any}
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[styles.categoryName, { color: colors.foreground, fontFamily: 'IBMPlexSans_600SemiBold' }]}
                numberOfLines={2}
              >
                {cat.name}
              </Text>
              <Text style={[styles.categoryCount, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
                {cat.count} product{cat.count !== 1 ? 's' : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
            Featured Products
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/products')}>
            <Text style={[styles.seeAll, { color: colors.accent, fontFamily: 'IBMPlexSans_500Medium' }]}>
              See all
            </Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredProducts.map((product) => (
            <Pressable
              key={product.id}
              style={({ pressed }) => [
                styles.featuredCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => handleProductPress(product.id)}
            >
              <View style={[styles.featuredIcon, { backgroundColor: colors.secondary }]}>
                <MaterialCommunityIcons
                  name={product.iconName as any}
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={[styles.featuredBadge, { backgroundColor: colors.accent + '18' }]}>
                <Text style={[styles.featuredBadgeText, { color: colors.accent, fontFamily: 'IBMPlexSans_500Medium' }]}>
                  {product.series}
                </Text>
              </View>
              <Text
                style={[styles.featuredName, { color: colors.foreground, fontFamily: 'IBMPlexSans_600SemiBold' }]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <Text
                style={[styles.featuredDesc, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}
                numberOfLines={2}
              >
                {product.shortDesc}
              </Text>
              <View style={styles.featuredFooter}>
                <Text style={[styles.featuredLink, { color: colors.primary, fontFamily: 'IBMPlexSans_500Medium' }]}>
                  View specs
                </Text>
                <Feather name="arrow-right" size={14} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* CTA Banner */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={['#EF6F24', '#D95F18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaBanner}
        >
          <View style={styles.ctaContent}>
            <Text style={[styles.ctaTitle, { fontFamily: 'IBMPlexSans_700Bold' }]}>
              Need a custom solution?
            </Text>
            <Text style={[styles.ctaDesc, { fontFamily: 'IBMPlexSans_400Regular' }]}>
              Our engineers are ready to help you find the right drive for your application.
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleQuotePress}
          >
            <Text style={[styles.ctaBtnText, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
              Get Quote
            </Text>
          </Pressable>
        </LinearGradient>
      </View>

      <View style={{ height: Platform.OS === 'web' ? 34 : 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  hero: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoStar: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    gap: 12,
    marginBottom: 28,
  },
  heroLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 36,
    color: '#FFFFFF',
    lineHeight: 42,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 20,
    gap: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
  section: {
    marginTop: 28,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
  },
  seeAll: {
    fontSize: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  categoryCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    lineHeight: 18,
  },
  categoryCount: {
    fontSize: 12,
  },
  featuredScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: 180,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  featuredIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  featuredName: {
    fontSize: 14,
    lineHeight: 19,
  },
  featuredDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  featuredLink: {
    fontSize: 13,
  },
  ctaSection: {
    paddingHorizontal: 16,
    marginTop: 28,
  },
  ctaBanner: {
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctaContent: {
    flex: 1,
    gap: 6,
  },
  ctaTitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  ctaDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  ctaBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
