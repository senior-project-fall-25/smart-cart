import { useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function ProductDetails({ }: { allergens?: string[] }) {
  const router = useRouter();
  const { product, allergens } = useLocalSearchParams<{
    product?: string;
    allergens?: string;
  }>();
  const data = product ? JSON.parse(decodeURIComponent(product as string)) : null;
  const allergenList = allergens ? JSON.parse(decodeURIComponent(allergens as string)) : [];

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No product data found.</Text>
      </View>
    );
  }

  const tracesArray = Array.isArray(data.traces)
    ? data.traces
    : typeof data.traces === "string"
      ? data.traces.split(",").map((t: string) => t.trim().toLowerCase())
      : [];

  const found = tracesArray.some((trace: string) =>
    allergenList?.includes(trace.toLowerCase())
  );

  const pickStyles: Record<string, { color: string; border: string }> = {
    'Dangerous Pick': { color: '#ff4d4d', border: '#ffcccc' },
    'Risky Pick': { color: '#ff914d', border: '#ffd6b3' },
    'Safe Pick': { color: '#5ca3ff', border: '#b3d4ff' },
    'Excellent Pick': { color: '#00b578', border: '#a3f5ce' },
  };

  const pickStyle = pickStyles[data.pick || 'Safe Pick'];


  const styles = StyleSheet.create({
    addButton: {
      backgroundColor: "#5CA3FF",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 20,
    },
    addButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "DM-Sans",
    },
  });


  const defaultListId = "abc123";


  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 16 }}>

      {/* Product Image */}
      {data.image ? (
        <Image
          source={{ uri: data.image }}
          style={{ width: "100%", height: 250, borderRadius: 12, marginBottom: 16 }}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={require('../assets/logos/logo3.png')}
          style={{ width: "100%", height: 250, borderRadius: 12, marginBottom: 16, opacity: 0.5 }}
          resizeMode="contain"
        />
      )}

      {/* Brand + Title */}
      <Text style={{ fontFamily: "DM-Sans", fontSize: 16, color: "gray", textTransform: "capitalize", marginBottom: 4 }}>
        {data.brand}
      </Text>
      <Text style={{ fontFamily: "DM-Sans-Medium", fontSize: 22, fontWeight: "bold", textTransform: "capitalize" }}>
        {data.title}
      </Text>

      {/* Pick Pill */}
      {data.pick && (
        <View
          style={{
            marginTop: 12,
            alignSelf: 'flex-start',
            backgroundColor: 'white',
            borderColor: pickStyle.border,
            borderWidth: 1.5,
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {data.pick === 'Dangerous Pick' ? (
            <Ionicons name="warning" size={18} color={pickStyle.color} />
          ) : data.pick === 'Risky Pick' ? (
            <Ionicons name="alert-circle-outline" size={18} color={pickStyle.color} />
          ) : data.pick === 'Safe Pick' ? (
            <Ionicons name="checkmark-circle-outline" size={18} color={pickStyle.color} />
          ) : (
            <Ionicons name="star" size={18} color={pickStyle.color} />
          )}
          <Text style={{ color: pickStyle.color, fontWeight: '700', fontSize: 14, fontFamily: 'DM-Sans-Medium' }}>
            {data.pick}
          </Text>
        </View>
      )}

      {/* Logo separator */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: "#eee", marginVertical: 24, position: "relative" }}>
        <Image
          source={require('../assets/logos/logo2.png')}
          style={{ width: "100%", height: 30, position: 'absolute', top: -15 }}
          resizeMode="contain"
        />
      </View>

      {/* Allergen Warning */}
      <Text style={{
        fontFamily: "DM-Sans",
        fontSize: 16,
        marginBottom: 12,
        color: found ? 'red' : 'green',
        fontWeight: '600',
      }}>
        {found ? '⚠ Warning: May contain traces of allergens!' : 'No allergens detected.'}
      </Text>

      {/* Ingredients */}
      <Text style={{ fontFamily: "DM-Sans", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        Ingredients
      </Text>
      {data.ingredients?.length ? (
        data.ingredients.map((ing: string, index: number) => (
          <Text key={index} style={{ marginBottom: 4 }}>• {ing}</Text>
        ))
      ) : (
        <Text style={{ marginBottom: 4 }}>No ingredients available.</Text>
      )}


      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          const encoded = encodeURIComponent(JSON.stringify(data));
          router.push(`/ChooseList?product=${encoded}`);
        }}
      >
        <Text style={styles.addButtonText}>Add to Shopping List</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
