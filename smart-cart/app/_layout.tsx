
import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/FirebaseConfig";
import { ActivityIndicator, View, Text } from "react-native";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';



export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {

  // Load fonts here
  const [fontsLoaded] = useFonts({
    DMSans: require("../assets/font/DM_Sans/DMSans-VariableFont_opsz,wght.ttf"),
    DMSansItalic: require("../assets/font/DM_Sans/DMSans-Italic-VariableFont_opsz,wght.ttf"),
    "DMSans-Bold": require("../assets/font/DM_Sans/static/DMSans-Bold.ttf"),
    "DM-Sans": require("../assets/font/DM_Sans/static/DMSans-Regular.ttf"),
    "DM-Sans-Bold": require("../assets/font/DM_Sans/static/DMSans-Bold.ttf"),
    "DM-Sans-Italic": require("../assets/font/DM_Sans/static/DMSans-Italic.ttf"),
    "DM-Sans-SemiBold": require("../assets/font/DM_Sans/static/DMSans-SemiBold.ttf"),
    "DM-Sans-Medium": require("../assets/font/DM_Sans/static/DMSans-Medium.ttf"),
  });

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {

    const subscriber = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return subscriber
  }, []);

  const colorScheme = useColorScheme();

  // Show a simple loading screen until fonts are ready
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  if (initializing)
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,

        }}>
        <ActivityIndicator size="large" />
      </View>
    );






  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>


        {/* Auth Routes */}
        <Stack.Screen name="signIn" />
        <Stack.Screen name="signUp" />


        <Stack.Screen name="home" />
        <Stack.Screen
          name="shopListDetails"
          options={{
            title: "",
            headerShown: true,
            headerBackTitle: "Back",
            headerTitleStyle: { fontFamily: 'DM-Sans-Medium', fontSize: 18 },
            headerBackTitleStyle: { fontFamily: 'DM-Sans-Medium' },
          }}
        />
        <Stack.Screen name="index" options={{ title: '' }} />
        <Stack.Screen name="Profile-Creation" options={{ headerShown: false }} />
        <Stack.Screen name="Tabs" options={{ headerShown: false }} />
        <Stack.Screen
          name="Details"
          options={{
            title: "Product Details",
            headerShown: true,
            headerBackTitle: "Back",
            headerTitleStyle: { fontFamily: 'DM-Sans-Medium', fontSize: 18 },
            headerBackTitleStyle: { fontFamily: 'DM-Sans-Medium' },
          }}
        />
        <Stack.Screen
          name="ChooseList"
          options={{
            title: "",
            headerShown: true,
            headerBackTitle: "Back",
            headerTitleStyle: { fontFamily: 'DM-Sans-Medium', fontSize: 18 },
            headerBackTitleStyle: { fontFamily: 'DM-Sans-Medium' },
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );


}
