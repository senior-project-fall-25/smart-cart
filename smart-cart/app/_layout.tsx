import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Load fonts here
  const [fontsLoaded] = useFonts({
    'DM-Sans': require('../assets/font/DM_Sans/static/DMSans-Regular.ttf'),
    'DM-Sans-Bold': require('../assets/font/DM_Sans/static/DMSans-Bold.ttf'),
    'DM-Sans-Italic': require('../assets/font/DM_Sans/static/DMSans-Italic.ttf'),
  });

  // Show a simple loading screen until fonts are ready
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
