import React from 'react';
import {
  Linking,
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

const CONTACT_INFO = {
  company: 'Starshine Drive',
  address: 'Wenzhou Industrial Park\nZhejiang Province, China',
  phone: '+91 9925001323',
  email: 'sales@starshinedrive.com',
  hours: 'Mon – Fri  8:30 AM – 5:30 PM CST',
};

export default function ContactScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  function handleCall() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`);
  }

  function handleEmail() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`mailto:${CONTACT_INFO.email}`);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100,
          paddingTop: topPad + 12,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
          Contact Us
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
          Reach out for quotes, technical support, or partnership inquiries
        </Text>
      </View>

      {/* Quick actions */}
      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleCall}
          testID="contact-call"
        >
          <Feather name="phone" size={20} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
            Call Us
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleEmail}
          testID="contact-email"
        >
          <Feather name="mail" size={20} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
            Email Us
          </Text>
        </Pressable>
      </View>

      {/* Contact details card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ContactRow
          icon={<MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.primary} />}
          label="Address"
          value={CONTACT_INFO.address}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ContactRow
          icon={<Feather name="phone" size={18} color={colors.primary} />}
          label="Phone"
          value={CONTACT_INFO.phone}
          onPress={handleCall}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ContactRow
          icon={<Feather name="mail" size={18} color={colors.primary} />}
          label="Email"
          value={CONTACT_INFO.email}
          onPress={handleEmail}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ContactRow
          icon={<Feather name="clock" size={18} color={colors.primary} />}
          label="Business Hours"
          value={CONTACT_INFO.hours}
          colors={colors}
        />
      </View>

      {/* Get a quote CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.quoteCta,
          { backgroundColor: colors.secondary, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push('/(tabs)/quote')}
      >
        <View style={styles.quoteCtaContent}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.primary} />
          <View style={styles.quoteCtaText}>
            <Text style={[styles.quoteCtaTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_600SemiBold' }]}>
              Request a Quote
            </Text>
            <Text style={[styles.quoteCtaDesc, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
              Get a tailored price for your exact requirements
            </Text>
          </View>
        </View>
        <Feather name="arrow-right" size={18} color={colors.primary} />
      </Pressable>

      {/* About card */}
      <View style={[styles.card, styles.aboutCard, { backgroundColor: colors.primary }]}>
        <View style={styles.aboutRow}>
          <View style={[styles.aboutStar, { backgroundColor: '#EF6F24' }]}>
            <MaterialCommunityIcons name="star-four-points" size={14} color="#FFFFFF" />
          </View>
          <Text style={[styles.aboutBrand, { fontFamily: 'IBMPlexSans_700Bold' }]}>
            STARSHINE DRIVE
          </Text>
        </View>
        <Text style={[styles.aboutText, { fontFamily: 'IBMPlexSans_400Regular' }]}>
          Specialized manufacturer of industrial gear reducers and gearboxes with over 20 years of experience. Serving customers in 50+ countries with precision power transmission solutions.
        </Text>
      </View>
    </ScrollView>
  );
}

function ContactRow({
  icon,
  label,
  value,
  onPress,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const content = (
    <View style={rowStyles.row}>
      <View style={[rowStyles.iconWrap, { backgroundColor: colors.secondary }]}>{icon}</View>
      <View style={rowStyles.textWrap}>
        <Text style={[rowStyles.label, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_500Medium' }]}>
          {label}
        </Text>
        <Text style={[rowStyles.value, { color: onPress ? colors.primary : colors.foreground, fontFamily: 'IBMPlexSans_400Regular' }]}>
          {value}
        </Text>
      </View>
      {onPress && <Feather name="external-link" size={14} color={colors.mutedForeground} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: { flex: 1, gap: 2 },
  label: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  value: { fontSize: 14, lineHeight: 20 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  titleSection: {
    gap: 6,
    paddingHorizontal: 4,
  },
  title: { fontSize: 28 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  quoteCta: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  quoteCtaText: { flex: 1, gap: 3 },
  quoteCtaTitle: { fontSize: 15 },
  quoteCtaDesc: { fontSize: 13, lineHeight: 18 },
  aboutCard: { borderWidth: 0, padding: 20, gap: 12 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aboutStar: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutBrand: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1,
  },
  aboutText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 20,
  },
});
