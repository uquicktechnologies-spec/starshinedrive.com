import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function ProductStackLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontFamily: 'IBMPlexSans_600SemiBold',
          fontSize: 16,
          color: colors.foreground,
        },
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{ title: 'Product Details' }}
      />
    </Stack>
  );
}
