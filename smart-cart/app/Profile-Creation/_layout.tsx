import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';


export default function ProfileCreationLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="introduction" options={{ title: '' }} />
        <Stack.Screen name="set-allergens" options={{ title: '' }} />
        <Stack.Screen name="finish-profile" options={{ title: '' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
