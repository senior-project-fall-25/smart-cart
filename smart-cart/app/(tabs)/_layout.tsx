import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Image } from "react-native";
import { auth } from "@/src/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { House,ListPlus,ScanQrCode, User } from 'lucide-react-native';
import { IconSymbol } from "@/components/ui/icon-symbol";





export default function TabsLayout() {

  useEffect(() => {

      // checks if user its the current user if not it signs out
      if (!auth.currentUser) {
        router.replace("/signIn");
        return;
      }
      // signs out on auth state change
      const sub = onAuthStateChanged(auth, (u) => {
        if (!u) router.replace("/signIn");
      });
      return sub;
  }, []);


  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: true,
          headerTitleAlign: "center",

          //logo 
          headerTitle: () => (
            <Image
              source={require("../../assets/logos/logo1.png")}
              style={{ height: 28, width: 200, resizeMode: "contain" }}
            />
          ),
          tabBarLabel: "Home",
          tabBarIcon: ({color, size}) => <House color={color} size={size} />,
        }}
      />


      <Tabs.Screen
        name="list"
        options={{ 
          headerShown: true,
          headerTitleAlign: "center",

          //logo 
          headerTitle: () => (
            <Image
              source={require("../../assets/logos/logo1.png")}
              style={{ height: 28, width: 200, resizeMode: "contain" }}
            />
          ),
          tabBarLabel: "List",
          tabBarIcon: ({color, size}) => <ListPlus color={color} size={size} />,
          
        }}
        
      />
      <Tabs.Screen
        name="scanner"
        options={{ 
          headerShown: true,
          headerTitleAlign: "center",

          //logo 
          headerTitle: () => (
            <Image
              source={require("../../assets/logos/logo1.png")}
              style={{ height: 28, width: 200, resizeMode: "contain" }}
            />
          ),
          tabBarLabel: "Scan",
          tabBarIcon: ({color, size}) => <ScanQrCode color={color} size={size} />,

         }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          headerTitleAlign: "center",

          //logo 
          headerTitle: () => (
            <Image
              source={require("../../assets/logos/logo1.png")}
              style={{ height: 28, width: 200, resizeMode: "contain" }}
            />
          ),
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="magnifyingglass.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}