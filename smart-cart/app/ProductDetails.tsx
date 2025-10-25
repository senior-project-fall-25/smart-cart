import { useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";

export default function ProductDetails({ }: { allergens?: string[] }) {
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
  allergenList?.includes(trace.toLowerCase()));  

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 16 }}>
      {data.image && (
        <Image
          source={{ uri: data.image }}
          style={{
            width: "100%",
            height: 250,
            borderRadius: 12,
            marginBottom: 16,
          }}
          resizeMode="contain"
        />
      )}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
        {data.title}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 4 }}>
        Brand: {data.brand}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 4 }}>
        Nutriscore: {data.nutriscore || "N/A"}
      </Text>

      {found !== undefined && (
        <Text style={{ fontSize: 16, marginBottom: 4, color: found ? 'red' : 'green' }}>
          {found ? 'Warning: Contains allergens!' : 'No allergens detected.'}
        </Text>
      )}

      <Text style={{ marginTop: 12, fontWeight: "bold", fontSize: 18 }}>
        Ingredients
      </Text>
      {data.ingredients?.length ? (
        data.ingredients.map((ing: string, index: number) => (
          <Text key={index}>• {ing}</Text>
        ))
      ) : (
        <Text>No ingredients available.</Text>
      )}
    </ScrollView>
  );
}
