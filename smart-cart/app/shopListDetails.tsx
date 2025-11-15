import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { fetchProductsForList, removeItemsFromList } from "../app/Database/shoppingListRequest";
import { useLocalSearchParams, useRouter } from "expo-router";

type Product = {
  id: string;
  title: string;
  brand: string;
  image?: string | null;
};

export default function ListDetail() {
  const { listId, listName } = useLocalSearchParams<{ listId: string; listName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // use router.back() from navigation header (no custom safeBack needed)

  useEffect(() => {
    loadProducts();
    // reset selection when listId changes
    return () => setSelectedIds({});
  }, [listId]);

  async function loadProducts() {
    setLoading(true);
    try {
      const prods = await fetchProductsForList(listId);
      setProducts(prods || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function enterEdit() {
    setEditing(true);
    setSelectedIds({});
  }

  function cancelEdit() {
    setEditing(false);
    setSelectedIds({});
  }

  const confirmDelete = () => {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) {
      Alert.alert("No items selected", "Please select items to delete.");
      return;
    }
    Alert.alert(
      "Delete selected items?",
      `Remove ${ids.length} item(s) from "${listName || "this list"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeItemsFromList(listId, ids);
              // refresh
              await loadProducts();
              setEditing(false);
              setSelectedIds({});
            } catch (e) {
              console.error("Delete failed", e);
              Alert.alert("Error", "Could not delete items. Try again.");
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const selected = !!selectedIds[item.id];
    return (
      <Pressable
        onPress={() => (editing ? toggleSelect(item.id) : null)}
        onLongPress={() => toggleSelect(item.id)}
        style={[
          styles.productCard,
          selected && { backgroundColor: "#ffecec", borderColor: "#ff6b6b" },
        ]}
      >
        <Image
          source={item.image ? { uri: item.image } : require("../assets/logos/logo3.png")}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title || "Untitled"}
          </Text>
          <Text style={styles.productBrand}>{item.brand || "Unknown Brand"}</Text>
        </View>

        {editing && (
          <View style={styles.checkbox}>
            <Text style={{ color: selected ? "white" : "#333" }}>{selected ? "✓" : ""}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#5CA3FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row: centered title (no edit button here) */}
      <View style={styles.headerRow}>
        <View style={styles.headerSide} />
        <Text style={[styles.title, styles.titleCentered]}>{listName || "Shopping List"}</Text>
        <View style={styles.headerSide} />
      </View>

      {/* Logo Separator */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Image source={require("../assets/logos/logo2.png")} style={styles.separatorLogo} resizeMode="contain" />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        ListEmptyComponent={<Text style={styles.emptyText}>No items in this list yet.</Text>}
        contentContainerStyle={{ padding: 12, paddingBottom: 160 }} // extra bottom padding for action bar
      />

      {/* Bottom action bar: Edit / Delete + Cancel */}
      <View style={styles.bottomBar}>
        {!editing ? (
          <TouchableOpacity style={styles.bottomButton} onPress={enterEdit}>
            <Text style={styles.bottomButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  headerRow: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18, paddingTop: 6 },
  backBtn: { padding: 6 },
  editBtn: { padding: 6 },
  cancelBtn: { padding: 6, justifyContent: "center" },
  actionBtn: { backgroundColor: "#ff6b6b", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", fontFamily: "DM-Sans-SemiBold", marginTop: 10 }, // lowered slightly
  productCard: { flexDirection: "row", backgroundColor: "#f9f9f9", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee", alignItems: "center" },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1, justifyContent: "center" },
  productTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  productBrand: { fontSize: 13, color: "#666", marginTop: 4 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999", fontSize: 16 },
  checkbox: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: "#ccc", alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
  headerSide: { width: 60 },
  titleCentered: { flex: 1, textAlign: "center" },

  // separator styles (adds space between header/title and line)
  separatorContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 18,
    position: "relative",
    paddingBottom: 8,
  },
  separatorLine: {
    width: "78%",
    height: 1,
    backgroundColor: "#D9D9D9",
  },
  separatorLogo: {
    position: "absolute",
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    top: -18,
  },

  bottomBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 36, // lifted a bit from bottom
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    backgroundColor: "#5CA3FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  bottomButtonText: { color: "white", fontWeight: "700" },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  deleteText: { color: "white", fontWeight: "700" },
  cancelButton: {
    width: 120,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#5CA3FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#5CA3FF", fontWeight: "700" },
});
