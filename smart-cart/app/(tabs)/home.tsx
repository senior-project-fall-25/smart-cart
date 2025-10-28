import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, styles.pin]}>📌 Pinned Lists:</Text>

      {/* spacer */}
      <View style={{ flex: 1 }} />

      <Text style={styles.sectionTitle}>Past Lists:</Text>

      {/* spacer */}
      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    textAlign: "left",
    fontSize: 18,
    fontWeight: "600", 
  },
  pin: {
    marginTop: 24, 
  },
});