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
      <Text style={{ fontFamily: "DM-Sans", fontSize: 16, color: "gray" }}>
        {data.brand}
      </Text>
      <Text style={{ fontFamily: "DM-Sans-Medium", fontSize: 22, fontWeight: "bold"}}>
        {data.title}
      </Text>
      
      <Text style={{ fontFamily: "DM-Sans-Medium", fontSize: 20, marginBottom: 8, marginTop: 4 }}>
        Nutriscore: {data.nutriscore || "N/A"}
      </Text>

      {/*/ Logo separator */}
      <View style={{ borderBottomWidth: 2, borderBottomColor: "lightgray", marginBottom: 25, marginTop: 20, borderRadius: 8 }}>
        <Image
          source={require('../assets/logos/logo2.png')}
          style={{
            width: "100%",
            height: 35,
            // borderRadius: 12,
            marginBottom: 16,
            position: 'absolute',
            top: -15,
          }}
          resizeMode="contain"
        />
      </View>

      {found !== undefined && (
        <Text style={{ fontFamily: "DM-Sans", fontSize: 16, marginTop: 4,marginBottom: 4, color: found ? 'red' : 'green' }}>
          {found ? 'Warning: Contains allergens!' : 'No allergens detected.'}
        </Text>
      )}

      <Text style={{ fontFamily: "DM-Sans", marginTop: 12, fontWeight: "bold", fontSize: 18 }}>
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
