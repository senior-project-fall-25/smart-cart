import { useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function ProductDetails({ }: { allergens?: string[] }) {
  const router = useRouter();
  const { product, allergens } = useLocalSearchParams<{
    product?: string;
    allergens?: string;
  }>();
  const data = product ? JSON.parse(decodeURIComponent(product as string)) : null;
  const [imgUri, setImgUri] = useState(data?.image || null);
  const [hasError, setHasError] = useState(false);
  const allergenList = allergens ? JSON.parse(decodeURIComponent(allergens as string)) : [];

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No product data found.</Text>
      </View>
    );
  }
  console.log("data image: ", data.image);

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

  const pickStyle = pickStyles[data.pick || 'Risky Pick'];

  const styles = StyleSheet.create({
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
    pill: {
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginRight: 8,
      marginBottom: 8,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
  });

  const getReasonPills = () => {
    if (data.nutriscore?.length > 1) {
      data.nutriscore = null;
    }
    switch (data.pick) {
      case "Excellent Pick":
        return [
          { icon: "checkmark-circle-outline", text: "No allergens in ingredients" },
          { icon: "shield-checkmark-outline", text: "No traces of allergens in the facility" },
          { icon: "leaf-outline", text: `NutriScore ${data.nutriscore?.toUpperCase() || "Unknown"} - healthier choice` },
        ];
      case "Safe Pick":
        const nutriText = data.nutriscore
          ? `${data.nutriscore.toUpperCase()} - less healthy choice`
          : "Unknown";

        return [
          { icon: "checkmark-circle-outline", text: "No allergens in ingredients" },
          { icon: "shield-checkmark-outline", text: "No traces of allergens in the facility" },
          { icon: "leaf-outline", text: `NutriScore ${nutriText}` },
        ];
      case "Risky Pick":
        return [
          { icon: "checkmark-circle-outline", text: "No allergens in ingredients" },
          { icon: "alert-circle-outline", text: "May contain traces of allergens from facility" },
          { icon: "leaf-outline", text: `NutriScore ${data.nutriscore?.toUpperCase() || "Unknown"}` },
        ];
      case "Dangerous Pick":
        return [
          { icon: "warning-outline", text: "Contains allergens in ingredients" },
          { icon: "leaf-outline", text: `NutriScore ${data.nutriscore?.toUpperCase() || "Unknown"}` },
        ];
      default:
        return [];
    }
  };

  const reasonPills = getReasonPills();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 140,
          }}
          showsVerticalScrollIndicator={true}
        >
          {/* Product Image */}
          <Image
            source={imgUri && !hasError ? { uri: imgUri } : require('../assets/logos/logo3.png')}
            style={{
              width: "100%",
              height: 250,
              borderRadius: 12,
              marginBottom: 16,
              opacity: hasError ? 0.5 : 1, // 50% if fallback
            }}
            resizeMode="contain"
            onError={() => setHasError(true)}
          />

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

          {reasonPills.length > 0 && (
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              marginVertical: 12,
              gap: 6,
            }}>
              {reasonPills.map((pill, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderWidth: 1.5,
                    borderColor: pickStyle.border,
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    backgroundColor: "white",
                  }}
                >
                  <Ionicons name={pill.icon as any} size={16} color={pickStyle.color} />
                  <Text style={{ color: pickStyle.color, fontFamily: "DM-Sans-Medium", fontSize: 14 }}>
                    {pill.text}
                  </Text>
                </View>
              ))}
            </View>
          )}



          {/* Ingredients */}
          <Text style={{ fontFamily: "DM-Sans", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            Ingredients
          </Text>
          {data.ingredients?.length ? (
            data.ingredients.map((ing: string, index: number) => (
              <Text key={index} style={{ marginBottom: 4, fontFamily: "DM-Sans" }}>• {ing}</Text>
            ))
          ) : (
            <Text style={{ marginBottom: 4 }}>No ingredients available.</Text>
          )}
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 16,
            right: 16,
          }}
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              const encoded = encodeURIComponent(JSON.stringify(data));
              router.push({
                pathname: '/ChooseList',
                params: {product: encoded}
              });
            }}
          >
            <Text style={styles.addButtonText}>Add to Shopping List</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
