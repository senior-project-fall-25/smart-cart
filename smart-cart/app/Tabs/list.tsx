import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, Image, Button, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { ProductText, ProductHeader, ProductBrand } from '@/app/SmartCartStyles';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions, Switch } from 'react-native';
import { getUser } from '../Database/requests';

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
  pick?: string | null;
};
type RootStackParamList = {
  Details: { product: Product };
};

const ProductImage: React.FC<{ uri?: string | null; style?: object }> = ({ uri, style }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      source={uri && !hasError ? { uri } : require('../../assets/logos/logo3.png')}
      style={{
        ...style,
        borderRadius: uri && !hasError ? 8 : 0,
        opacity: uri && !hasError ? 1 : 0.5,
      }}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
};

const ListScreen = () => {
  const [isLoading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerms, setSearchTerms] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [includeAllergens, setIncludeAllergens] = useState(false);
  const [tempIncludeAllergens, setTempIncludeAllergens] = useState(false);
  const toggleIncludeAllergens = () => setIncludeAllergens(previousState => !previousState);
  const [searchInput, setSearchInput] = useState("");
  const [user, setUser] = useState(null);

  // UI Card Dimensions for Products
  const screenWidth = Dimensions.get('window').width;
  const CARD_WIDTH = (screenWidth - 24 * 2) / 2; // 24 padding on each side + 16 margin between cards


  // Navigation and Modals
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      await getUser(setLoading, setUser, setAllergens);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User loaded:", user);
    }
  }, [user, allergens]);

  const openModal = () => {
    setTempIncludeAllergens(includeAllergens)
    setModalVisible(true);
  }
  const closeModal = () => setModalVisible(false);

  const applyModalChanges = () => {
    if (tempIncludeAllergens !== includeAllergens) {
      setIncludeAllergens(tempIncludeAllergens);
    }
    closeModal();
  };

  useEffect(() => {
    if (searchTerms.trim() !== "") {
      getProducts();
    }
  }, [includeAllergens]);

  const getProducts = async (term = searchTerms) => {
    if (term.trim() === "") return;
    try {
      await getUser(setLoading, setUser, setAllergens);
      setLoading(true);
      setProducts([]);

      const page_size = 26;
      const baseUrl = "https://us.openfoodfacts.net/cgi/search.pl";
      const params = [
        `search_terms=${encodeURIComponent(term)}`,
        "search_simple=1",
        "action=process",
        "json=1",
        "nocache=1",
        `page_size=${page_size}`,
        "sort_by=popularity_key",
      ];

      let index = 0;
      if (!includeAllergens) {
        allergens.forEach((a) => {
          params.push(`tagtype_${index}=allergens`);
          params.push(`tag_contains_${index}=does_not_contain`);
          params.push(`tag_${index}=${encodeURIComponent(a.toLowerCase())}`);
          index++;
        });
      }

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
      console.log("params: " + params.join("&"));

      const json = await response.json();
      const filteredProducts: Product[] = json.products
        .filter((p: any) => Array.isArray(p.ingredients) && p.ingredients.length > 0)
        .map((p: any) => ({
          id: p.code,
          title: p.product_name || "Unknown",
          brand: p.brands || "No Brand",
          ingredients: p.ingredients ? getIngredients(p.ingredients) : [],
          image: p.image_front_url || p.image_url || null,
          nutriscore: p.nutriscore_grade || null,
          allergens: p.allergens || [],
          additives: p.additives || [],
          traces: getTraces(p.traces_tags) || [],
          pick: pickCalcuator(
            getTraces(p.traces_tags) || [],
            p.allergens_tags || [], 
            p.nutriscore_grade || null,
            p.ingredients ? getIngredients(p.ingredients) : []
          ),

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
    // console.log("filteredtraces: " + filteredTraces);
    return filteredTraces;
  };

  const pickCalcuator = (
    traces: string[],
    pallergens: string[],
    nutriscore?: string,
    ingredients?: string[]
  ) => {
    const normalizedAllergens = allergens.map(a => a.toLowerCase());
    const normalizedTraces = traces.map(t => t.toLowerCase());
    const normalizedPAllergens = pallergens.map(a => a.toLowerCase());
    const normalizedIngredients = ingredients?.map(i => i.toLowerCase()) || [];

    // look for any user allergen in product traces, allergens, or ingredients
    const foundTraces = normalizedTraces.some(trace =>
      normalizedAllergens.includes(trace)
    );
    const foundAllergens = normalizedPAllergens.some(a =>
      normalizedAllergens.includes(a)
    );
    const foundIngredients = normalizedIngredients.some(i =>
      normalizedAllergens.some(a => i.includes(a))
    );

    if (foundAllergens || foundIngredients) {
      return "Dangerous Pick";
    } else if (foundTraces) {
      return "Risky Pick";
    } else if (nutriscore === "a" || nutriscore === "b" || nutriscore === "c") {
      return "Excellent Pick";
    } else {
      return "Safe Pick";
    }
  };

  // traces 
  // nutriscore 
  // on item load compare its traces to allergens 

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
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search Products"
          placeholderTextColor="gray"
          style={{
            fontSize: 16,
            flex: 1,
            paddingVertical: 8,
            fontFamily: "DM-Sans",
            color: "gray",
          }}
          returnKeyType="search"
          onSubmitEditing={() => {
            setProducts([]);
            setLoading(true);
            setSearchTerms(searchInput); // triggers new search term
            getProducts(searchInput);    // pass it directly to API call
          }}
        />

        <Ionicons
          name="options"
          size={28}
          color="gray"
          onPress={openModal}
        />
      </View>

      {/* OPTIONS MODAL */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >

          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'DM-Sans', fontSize: 18, marginBottom: 16 }}>
              Filter Options
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Text style={{ fontSize: 16, color: 'gray', fontFamily: 'DM-Sans' }}>Include allergens</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#5ca3ff' }}
                ios_backgroundColor="#3e3e3e"
                value={tempIncludeAllergens}
                onValueChange={setTempIncludeAllergens}
              />
            </View>
            <Text style={{ fontSize: 12, color: 'gray', fontFamily: 'DM-Sans', marginTop: 12 }}>Show products that contain your allergens in their ingredient lists.</Text>
            <View style={{ flexDirection: 'row', marginTop: 20, gap: 20 }}>
              <Button
                title="Close"
                color={'gray'}
                onPress={closeModal} />
              <Button
                title="Apply"
                color={'#5ca3ff'}
                onPress={applyModalChanges} />
            </View>
          </View>
        </View>
      </Modal>

      {/* SEARCH RESULTS */}
      {!isLoading && searchTerms.trim() !== "" && products.length > 0 && (
        <><Text
          style={{
            marginBottom: 0,
            fontFamily: "DM-Sans",
            fontSize: 16,
            color: "gray",
          }}
        >
          Showing results for <Text style={{ fontWeight: "600", color: "black" }}>{searchTerms}</Text>
        </Text><Text
          style={{
            marginBottom: 12,
            fontFamily: "DM-Sans",
            fontSize: 12,
            color: "gray",
          }}
        >
            {includeAllergens ? "Products containing your allergens are being shown." : "Products containing your allergens have been filtered out."}
          </Text></>
      )}
      {!isLoading && searchTerms.trim() === "" && products.length === 0 && (
        <Text
          style={{
            marginBottom: 12,
            fontFamily: "DM-Sans",
            fontSize: 16,
            color: "gray",
          }}
        >
          Try searching for a product above.
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
            
            const pickStyles: Record<string, { color: string; border: string }> = {
              'Dangerous Pick': { color: '#ff4d4d', border: '#ffcccc' },
              'Risky Pick': { color: '#ff914d', border: '#ffd6b3' },
              'Safe Pick': { color: '#5ca3ff', border: '#b3d4ff' },
              'Excellent Pick': { color: '#00b578', border: '#a3f5ce' },
            };

            const pickStyle = pickStyles[item.pick || 'Safe Pick'];

            return (
              <View
                style={{
                  width: CARD_WIDTH,
                  padding: 12,
                  borderRightWidth: isLeft ? 1 : 0,
                  borderBottomWidth: isLastRow ? 0 : 1,
                  borderColor: '#ddd',
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/Details',
                      params: {
                        product: JSON.stringify(item),
                        allergens: JSON.stringify(allergens),
                      },
                    })
                  }
                >
                  {/* Product Image */}
                  <View style={{ alignItems: 'center', marginBottom: 10 }}>
                    <ProductImage uri={item.image} style={{ width: 100, height: 100 }} />
                  </View>

                  {/* Brand + Title */}
                  <View style={{ marginLeft: 4 }}>
                    <ProductBrand>{item.brand}</ProductBrand>
                    <ProductHeader>{item.title}</ProductHeader>
                  </View>

                  {/* Pick Pill */}
                  {item.pick && (
                    <View
                      style={{
                        marginTop: 8,
                        alignSelf: 'flex-start',
                        backgroundColor: 'white',
                        borderColor: pickStyle.border,
                        borderWidth: 1.5,
                        borderRadius: 20,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      {item.pick === 'Dangerous Pick' ? (
                        <Ionicons name="warning" size={15} color={pickStyle.color} />
                      ) : item.pick === 'Risky Pick' ? (
                        <Ionicons name="alert-circle-outline" size={15} color={pickStyle.color} />
                      ) : item.pick === 'Safe Pick' ? (
                        <Ionicons name="checkmark-circle-outline" size={15} color={pickStyle.color} />
                      ) : (
                        <Ionicons name="star" size={15} color={pickStyle.color} />
                      )}
                      <Text
                        style={{
                          color: pickStyle.color,
                          fontWeight: '700',
                          fontSize: 12,
                          fontFamily: 'DM-Sans-Medium',
                        }}
                      >
                        {item.pick}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />


      )}

    </SafeAreaView>
  );
};





export default ListScreen;
