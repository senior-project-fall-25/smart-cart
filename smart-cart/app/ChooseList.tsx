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
  Modal,
  Image
} from "react-native";
import {
  fetchUserShoppingLists,
  addShoppingList,
  addItemToShoppingList,
  saveProductToDB
} from "../app/Database/shoppingListRequest";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


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

export default function ChooseList({ onDone }: Props) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { product: productParam } = useLocalSearchParams<{ product?: string }>();
  let product: any = undefined;

  if (productParam) {
    try {
      product = JSON.parse(productParam);
    } catch (e) {
      console.warn("Could not parse product param", e);
    }
  }

  const router = useRouter();

  console.log("Decoded product:", product);

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
      setModalVisible(false);
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
      await saveProductToDB(product);
      
      for (const id of selectedLists) {
        await addItemToShoppingList(product, id);
      }
      
      Alert.alert("Success", "Item added to selected list(s).");
      onDone?.();
      router.back(); 
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[styles.listText, selected && { color: "white" }]}>{item.name}</Text>
          {selected && <Ionicons name="checkmark-circle" size={20} color="white" />}
        </View>
        <Text style={[styles.dateText, selected && { color: "white" }]}>
          {new Date(item.createdAt).toLocaleDateString?.() ?? String(item.createdAt)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your Shopping Lists</Text>


      {/* Logo separator */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Image
          source={require('../assets/logos/logo2.png')}
          style={styles.separatorLogo}
          resizeMode="contain"
        />
      </View>


      <View style={{ flex: 1, width: "100%" }}>
        {loading ? (
          <Text style={{ marginTop: 20 }}>Loading...</Text>
        ) : lists.length === 0 ? (
          <Text style={styles.emptyText}>No lists found. Create some!</Text>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 150 }}
            style={{ flexGrow: 1 }}
          />
        )}

      </View>
      <View style={{ width: "100%", paddingBottom: 40 }}>
        {/* Create List Button */}
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.createButtonText}>+ Create New List</Text>
        </TouchableOpacity>

        {/* Add Item Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>Add Item to Selected List(s)</Text>
        </TouchableOpacity>
      </View>


      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <Text style={styles.modalText}>Enter the name of your new shopping list.</Text>
            <TextInput
              placeholder="List name"
              value={newListName}
              onChangeText={setNewListName}
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Create" onPress={handleCreateNewList} />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    fontFamily: "DM-Sans-SemiBold",
  },
  listItem: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listItemSelected: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  listText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "DM-Sans-Medium",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontFamily: "DM-Sans",
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
    color: "#999",
  },
  createButton: {
    backgroundColor: "#ffffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 12,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#5CA3FF"
  },
  createButtonText: {
    color: "#5CA3FF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DM-Sans-Medium",

  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8, fontFamily: "DM-Sans-Medium" },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: "DM-Sans",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", fontFamily: "DM-Sans" },
  modalText: {
    fontSize: 14, marginBottom: 12, fontFamily: "DM-Sans", color: "grey",
  },
  addButton: {
    backgroundColor: "#5CA3FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DM-Sans",
  },
  separatorContainer: {
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    position: "relative",
    paddingBottom: 15
  },
  separatorLine: {
    width: "100%",
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

});
