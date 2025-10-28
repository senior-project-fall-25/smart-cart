import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, Image, Button, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { ProductText, ProductHeader, ProductBrand } from '@/app/SmartCartStyles';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

type Product = {
  id: string;
  title: string;
  brand: string;
  ingredients: string[];
  allergens?: string[];
  additives?: string[];
  traces?: string[];
  image?: string | null;
  nutriscore?: string | null;
};
type RootStackParamList = {
  Details: { product: Product };
  // add other routes here if needed
};

const SearchScreen = () => {
  const [isLoading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerms, setSearchTerms] = useState("");
  // const [additives, setAdditives] = useState<string[]>(["E150d", "E104"]);
  const [allergens, setAllergens] = useState<string[]>(["peanuts", "milk"]);

  const screenWidth = Dimensions.get('window').width;
  const CARD_WIDTH = (screenWidth - 24 * 2) / 2; // 24 padding on each side + 16 margin between cards

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const router = useRouter();
  // const navigation = useNavigation();

  const getProducts = async () => {
    try {
      setLoading(true);
      setProducts([]); // clear old results

      const page_size = 25;
      const baseUrl = "https://us.openfoodfacts.net/cgi/search.pl";
      const params = [
        `search_terms=${encodeURIComponent(searchTerms)}`,
        "search_simple=1",
        "action=process",
        "json=1",
        "nocache=1",
        `page_size=${page_size}`,
        "sort_by=popularity_key",
      ];

      let index = 0;

      // Exclude allergens
      allergens.forEach((a) => {
        params.push(`tagtype_${index}=allergens`);
        params.push(`tag_contains_${index}=does_not_contain`);
        params.push(`tag_${index}=${encodeURIComponent(a)}`);
        index++;
      });

      params.push(`tagtype_${index}=countries`);
      params.push(`tag_contains_${index}=contains`);
      params.push(`tag_${index}=United%20States`);

      const url = `${baseUrl}?${params.join("&")}`;
      const proxy = "https://corsproxy.io/?";

      const response = await fetch(proxy + url, {
        headers: {
          Authorization: "Basic " + btoa("off:off"),
          "User-Agent": "SmartCartApp/1.0 (maddieglaum@gmail.com)",
        },
      });

      const json = await response.json();
      const filteredProducts: Product[] = json.products.map((p: any) => ({
        id: p.code,
        title: p.product_name || "Unknown",
        brand: p.brands || "Unknown",
        ingredients: p.ingredients ? getIngredients(p.ingredients) : [],
        image: p.image_front_url || p.image_url || null,
        nutriscore: p.nutriscore_grade || null,
        allergens: p.allergens || [],
        additives: p.additives || [],
        traces: getTraces(p.traces_tags) || [],
      }));

      setProducts(filteredProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIngredients = (ingredients: any[]) => {
    let filteredIngredients: string[] = [];
    ingredients.forEach((ingredient) => {
      if (ingredient.is_in_taxonomy === 1) {
        filteredIngredients.push(ingredient.text);
      }
    });
    return filteredIngredients;
  };

  const getTraces = (traces: any[]) => {
    let filteredTraces: string[] = [];
    traces.forEach((trace_tag) => {
      if (trace_tag.startsWith("en:")) {
        filteredTraces.push(trace_tag.slice(3).replace(/-/g, " "));
      }
    });
    console.log("filteredtraces: " + filteredTraces);
    return filteredTraces;
  };



  /// RETURN
  return (

    <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor: 'white', gap: 8 }}>

      {/* SEARCH BAR */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: 8,
          paddingHorizontal: 10,
          marginBottom: 12,
          height: 40,
        }}
      >
        <Ionicons name="search" size={24} color="gray" style={{ marginRight: 8 }} />
        <TextInput
          value={searchTerms}
          onChangeText={setSearchTerms}
          placeholder="Search Products"
          placeholderTextColor="gray"
          style={{
            fontSize: 16,
            flex: 1,
            paddingVertical: 8,
            fontFamily: "DM-Sans",
            color: "gray",
          }}
          returnKeyType='search'
          onSubmitEditing={() => {
            setProducts([]);
            setLoading(true);
            getProducts();
          }}
        />
      </View>



      {/* SEARCH RESULTS */}
      {!isLoading && searchTerms.trim() !== "" && products.length > 0 && (
        <Text
          style={{
            marginBottom: 12,
            fontFamily: "DM-Sans",
            fontSize: 16,
            color: "gray",
          }}
        >
          Showing results for <Text style={{ fontWeight: "600", color: "black" }}>{searchTerms}</Text>
        </Text>
      )}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          renderItem={({ item, index }) => {
            const isLeft = index % 2 === 0; // left column if even index
            const isLastRow = index >= products.length - (products.length % 2 || 2); // last row check

            return (
              <View
                style={{
                  width: CARD_WIDTH,
                  padding: 8,
                  borderRightWidth: isLeft ? 1 : 0,
                  borderBottomWidth: isLastRow ? 0 : 1,
                  borderColor: '#ddd',
                  // alignItems: 'center',
                }}
              >
                <TouchableOpacity onPress={() =>
                  router.push({
                    pathname: "/Details",
                    params: {
                      product: encodeURIComponent(JSON.stringify(item)),
                      allergens: encodeURIComponent(JSON.stringify(allergens)),
                    },
                  })
                }>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={{
                        width: 100,
                        height: 100,
                        backgroundColor: '#eee',
                        borderRadius: 8,
                        marginBottom: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text>No Image</Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 4, alignContent: 'flex-start' }}>
                    <ProductBrand>{item.brand}</ProductBrand>
                    <ProductHeader>{item.title}</ProductHeader>
                    <ProductText>Pick Placeholder</ProductText>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />

      )}

    </SafeAreaView>
  );
};



export default SearchScreen;
