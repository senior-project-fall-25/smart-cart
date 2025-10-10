import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack >
      <Stack.Screen name="index" options={{ title: '' }} />
      <Stack.Screen name="Profile-Creation/introduction" options={{ title: '' }} />
      <Stack.Screen name="Profile-Creation/set-allergens" options={{ title: '' }} />
      <Stack.Screen name="Profile-Creation/finish-profile" options={{ title: '' }} />
    </Stack>
  );
}
