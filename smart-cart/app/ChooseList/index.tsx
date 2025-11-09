import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ChooseList from "../../components/ChooseList";

export default function ChooseListPage() {
  const router = useRouter();

  // Guard useSearchParams for web builds where it may not be callable
  let params: Record<string, string> = {};
  try {
    if (typeof useLocalSearchParams === "function") {
      // @ts-ignore
      params = useLocalSearchParams() ?? {};
    } else if (typeof window !== "undefined") {
      params = Object.fromEntries(new URLSearchParams(window.location.search));
    }
  } catch {
    if (typeof window !== "undefined") {
      params = Object.fromEntries(new URLSearchParams(window.location.search));
    }
  }

  const productParam = (params.product as string | undefined) ?? undefined;
  let product: any = undefined;
  if (productParam) {
    try {
      product = JSON.parse(decodeURIComponent(productParam));
    } catch (e) {
      console.warn("Could not parse product param", e);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={{ width: 60 }} />{/* spacer to center title */}
      </View>

      <ChooseList
        product={product}
        onDone={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: Platform.OS === "web" ? 64 : 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  backButton: {
    width: 60,
    height: 36,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backText: {
    color: "#5CA3FF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});