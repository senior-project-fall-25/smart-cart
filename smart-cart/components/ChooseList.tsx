import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import {
  fetchUserShoppingLists,
  addShoppingList,
  addItemToShoppingList,
} from "../app/Database/shoppingListRequest";

type ShoppingList = {
  id: string;
  name: string;
  createdAt: Date | string;
  productIDs?: string[];
};

type Props = {
  product?: any;
  onDone?: () => void;
};

export default function ChooseList({ product, onDone }: Props) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setLoading(true);
    try {
      const fetched = await fetchUserShoppingLists();
      setLists(fetched);
    } catch (e) {
      console.error("loadLists:", e);
      Alert.alert("Error", "Could not load shopping lists.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectList = (id: string) =>
    setSelectedLists((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleCreateNewList = async () => {
    const name = newListName.trim();
    if (!name) return;
    try {
      const created = await addShoppingList(name);
      setLists((p) => [...p, created]);
      setNewListName("");
      setSelectedLists((p) => [...p, created.id]);
    } catch (e) {
      console.error("create list:", e);
      Alert.alert("Error", "Could not create list.");
    }
  };

  const handleAddItem = async () => {
    if (!product) {
      Alert.alert("No product", "No product to add.");
      return;
    }
    if (selectedLists.length === 0) {
      Alert.alert("Select a list", "Please select at least one shopping list.");
      return;
    }
    try {
      for (const id of selectedLists) {
        await addItemToShoppingList(product, id);
      }
      Alert.alert("Success", "Item added to selected list(s).");
      onDone?.();
    } catch (e) {
      console.error("add item:", e);
      Alert.alert("Error", "Could not add item to lists.");
    }
  };

  const renderItem = ({ item }: { item: ShoppingList }) => {
    const selected = selectedLists.includes(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelectList(item.id)}
        style={[styles.listItem, selected && styles.listItemSelected]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
      >
        <Text style={[styles.listText, selected && { color: "white" }]}>{item.name}</Text>
        <Text style={[styles.dateText, selected && { color: "white" }]}>
          {new Date(item.createdAt).toLocaleDateString?.() ?? String(item.createdAt)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your Shopping Lists</Text>

      <FlatList
        data={lists}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 12 }}>No lists yet.</Text>}
        style={{ width: "100%" }}
      />

      <View style={styles.newListRow}>
        <TextInput
          placeholder="New list name"
          value={newListName}
          onChangeText={setNewListName}
          style={styles.input}
        />
        <Button title="Create" onPress={handleCreateNewList} />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
        <Text style={styles.addButtonText}>Add Item to Selected List(s)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "white" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: "DM-Sans-Bold",
  },

  // default row: light grey so it stands out from white page
  listItem: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginBottom: 10,
    backgroundColor: "#f2f2f2",
  },

  // selected row: red like selected allergens
  listItemSelected: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },

  listText: { fontSize: 16, fontWeight: "600", color: "#333" },
  dateText: { fontSize: 12, color: "#666", marginTop: 6 },
  newListRow: { flexDirection: "row", width: "100%", gap: 8, marginTop: 12, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 },
  addButton: { backgroundColor: "#5CA3FF", padding: 14, borderRadius: 12, width: "100%", alignItems: "center" },
  addButtonText: { color: "white", fontWeight: "700" },
});