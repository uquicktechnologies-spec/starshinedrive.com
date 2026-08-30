import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Product } from '@/constants/products';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
      testID={`product-card-${product.id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
        <MaterialCommunityIcons
          name={product.iconName as any}
          size={26}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.name, { color: colors.foreground, fontFamily: 'IBMPlexSans_600SemiBold' }]}
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.accent + '18' }]}>
            <Text style={[styles.badgeText, { color: colors.accent, fontFamily: 'IBMPlexSans_500Medium' }]}>
              {product.series}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.desc, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}
          numberOfLines={2}
        >
          {product.shortDesc}
        </Text>
      </View>

      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 15,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
