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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { INDUSTRIES } from '@/constants/industries';

export default function SolutionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  function handleQuotePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/quote');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 12, paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <View style={[styles.eyebrowIcon, { backgroundColor: colors.secondary }]}>
          <MaterialCommunityIcons name="factory" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.accent, fontFamily: 'IBMPlexSans_600SemiBold' }]}>
          DRIVE SOLUTIONS FOR EVERY LINE
        </Text>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
          The right drive for your industry
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
          Explore practical gearbox solutions for the machines and production lines you rely on.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
            Industry applications
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
            12 areas supported by Starshine Drive
          </Text>
        </View>
        <MaterialCommunityIcons name="arrow-down-circle-outline" size={24} color={colors.primary} />
      </View>

      <View style={styles.list}>
        {INDUSTRIES.map((industry, index) => (
          <View
            key={industry.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            testID={`industry-card-${industry.id}`}
          >
            <Image source={industry.image} style={styles.cardImage} resizeMode="cover" accessibilityLabel={`${industry.name} machinery`} />
            <View style={styles.cardBody}>
              <Text style={[styles.cardNumber, { color: colors.accent, fontFamily: 'IBMPlexSans_700Bold' }]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
                {industry.name}
              </Text>
              <Text style={[styles.cardDescription, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
                {industry.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.cta, { backgroundColor: colors.primary }]}>
        <View style={styles.ctaCopy}>
          <Text style={[styles.ctaTitle, { color: colors.primaryForeground, fontFamily: 'IBMPlexSans_700Bold' }]}>
            Need help selecting a drive?
          </Text>
          <Text
            style={[
              styles.ctaDescription,
              { color: colors.primaryForeground + 'BF', fontFamily: 'IBMPlexSans_400Regular' },
            ]}
          >
            Tell our engineers about your machine and application.
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}
          onPress={handleQuotePress}
          testID="solutions-request-quote"
        >
          <Text
            style={[
              styles.ctaButtonText,
              { color: colors.accentForeground, fontFamily: 'IBMPlexSans_600SemiBold' },
            ]}
          >
            Get a quote
          </Text>
          <Feather name="arrow-right" size={15} color={colors.accentForeground} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 20 },
  intro: { gap: 8, paddingHorizontal: 4 },
  eyebrowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  eyebrow: { fontSize: 11, letterSpacing: 1.4 },
  title: { fontSize: 29, lineHeight: 35, maxWidth: 350 },
  subtitle: { fontSize: 14, lineHeight: 21, maxWidth: 360 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 19 },
  sectionSub: { fontSize: 12, marginTop: 3 },
  list: { gap: 12 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 170 },
  cardBody: { padding: 16, gap: 6 },
  cardNumber: { fontSize: 11, letterSpacing: 1.2 },
  cardTitle: { fontSize: 19, lineHeight: 24 },
  cardDescription: { fontSize: 14, lineHeight: 21 },
  cta: {
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaCopy: { flex: 1, gap: 5 },
  ctaTitle: { fontSize: 16, lineHeight: 21 },
  ctaDescription: { fontSize: 13, lineHeight: 18 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaButtonText: { fontSize: 13 },
});