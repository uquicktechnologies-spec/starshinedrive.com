import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { PRODUCTS } from '@/constants/products';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();

  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground, fontFamily: 'IBMPlexSans_600SemiBold' }]}>
          Product not found
        </Text>
      </View>
    );
  }

  function handleQuote() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/quote');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === 'web' ? 34 + 24 : 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.secondary }]}>
          <MaterialCommunityIcons
            name={product.iconName as any}
            size={48}
            color={colors.primary}
          />
        </View>
        <View style={[styles.seriesBadge, { backgroundColor: colors.accent + '18' }]}>
          <Text style={[styles.seriesText, { color: colors.accent, fontFamily: 'IBMPlexSans_500Medium' }]}>
            {product.series}
          </Text>
        </View>
        <Text style={[styles.productName, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
          {product.name}
        </Text>
        <View style={[styles.categoryChip, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.categoryChipText, { color: colors.primary, fontFamily: 'IBMPlexSans_500Medium' }]}>
            {product.category}
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={[styles.description, { color: colors.foreground, fontFamily: 'IBMPlexSans_400Regular' }]}>
          {product.description}
        </Text>
      </View>

      {/* Specifications */}
      <SectionCard title="Specifications" icon="table" colors={colors}>
        {product.specs.map((spec, i) => (
          <View
            key={spec.label}
            style={[
              styles.specRow,
              {
                backgroundColor: i % 2 === 0 ? colors.background : colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.specLabel, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
              {spec.label}
            </Text>
            <Text style={[styles.specValue, { color: colors.foreground, fontFamily: 'IBMPlexSans_600SemiBold' }]}>
              {spec.value}
            </Text>
          </View>
        ))}
      </SectionCard>

      {/* Key Features */}
      <SectionCard title="Key Features" icon="star-outline" colors={colors}>
        <View style={styles.listContent}>
          {product.features.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.featureText, { color: colors.foreground, fontFamily: 'IBMPlexSans_400Regular' }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Typical Applications */}
      <SectionCard title="Typical Applications" icon="domain" colors={colors}>
        <View style={styles.listContent}>
          {product.applications.map((app, i) => (
            <View key={i} style={styles.appRow}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={[styles.appText, { color: colors.foreground, fontFamily: 'IBMPlexSans_400Regular' }]}>
                {app}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Quote CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.quoteBtn,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handleQuote}
        testID="product-quote-btn"
      >
        <MaterialCommunityIcons name="file-document-outline" size={20} color="#FFFFFF" />
        <Text style={[styles.quoteBtnText, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
          Request Quote for {product.name}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/(tabs)/contact')}>
        <Text style={[styles.contactLink, { color: colors.accent, fontFamily: 'IBMPlexSans_500Medium' }]}>
          Or contact our team directly →
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionCard({
  title,
  icon,
  colors,
  children,
}: {
  title: string;
  icon: string;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={[cardStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={cardStyles.cardHeader}>
        <MaterialCommunityIcons name={icon as any} size={18} color={colors.primary} />
        <Text style={[cardStyles.cardTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: {
    fontSize: 15,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    gap: 14,
    paddingTop: 0,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: { fontSize: 18 },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: -16,
    marginTop: 0,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  seriesText: { fontSize: 12, letterSpacing: 0.5 },
  productName: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryChipText: { fontSize: 12 },
  section: {
    paddingTop: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  specLabel: {
    fontSize: 13,
    flex: 1,
  },
  specValue: {
    fontSize: 13,
    textAlign: 'right',
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  quoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  quoteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  contactLink: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 4,
  },
});
