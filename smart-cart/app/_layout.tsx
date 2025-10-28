import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {  User,onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/FirebaseConfig";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";




export default function RootLayout() {

const [loaded] = useFonts({
  DMSans: require("../assets/font/DM_Sans/DMSans-VariableFont_opsz,wght.ttf"),
  DMSansItalic: require("../assets/font/DM_Sans/DMSans-Italic-VariableFont_opsz,wght.ttf"),
  "DMSans-Bold": require("../assets/font/DM_Sans/static/DMSans-Bold.ttf"),
});

const [initializing, setInitializing] = useState(true);
const [user, setUser] = useState<User | null>(null);

useEffect(() => {

  const subscriber = onAuthStateChanged(auth, (u) => {
    setUser(u);
    setInitializing(false);
  });
  return subscriber
},[]);


if (!loaded) return null;


if (initializing)
  return(
    <View 
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
  
      }}>
      <ActivityIndicator size= "large" />
    </View>
  );

  return (
  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>

    <Stack.Screen name="(tabs)" />
    <Stack.Screen name= "signIn"/>
    <Stack.Screen name= "signUp"/>
    <Stack.Screen name= "home"/>
  </Stack>



  )
  
}
