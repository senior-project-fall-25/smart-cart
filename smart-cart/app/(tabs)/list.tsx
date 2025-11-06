import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, Image, Button, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { ProductText, ProductHeader, ProductBrand } from '@/app/SmartCartStyles';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions, Switch } from 'react-native';

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
  // add other routes here if needed
};

const ListScreen = () => {
  const [isLoading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerms, setSearchTerms] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  // const [additives, setAdditives] = useState<string[]>(["E150d", "E104"]);
  const [allergens, setAllergens] = useState<string[]>(["peanuts", "milk"]);
  const [includeAllergens, setIncludeAllergens] = useState(false);
  const [tempIncludeAllergens, setTempIncludeAllergens] = useState(false);
  const toggleIncludeAllergens = () => setIncludeAllergens(previousState => !previousState);

  const screenWidth = Dimensions.get('window').width;
  const CARD_WIDTH = (screenWidth - 24 * 2) / 2; // 24 padding on each side + 16 margin between cards

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const router = useRouter();

  const openModal = () => {
    setTempIncludeAllergens(includeAllergens)
    setModalVisible(true);
  }
  const closeModal = () => setModalVisible(false);

  // const navigation = useNavigation();

  const applyModalChanges = () => {
    if (tempIncludeAllergens !== includeAllergens) {
      setIncludeAllergens(tempIncludeAllergens);
    }
    closeModal();
  };

  // re-run product search when includeAllergens changes
  useEffect(() => {
    if (searchTerms.trim() !== "") {
      getProducts();
    }
  }, [includeAllergens]);


  const getProducts = async () => {
    if (searchTerms.trim() === "") {
      return;
    }
    try {
      setLoading(true);
      setProducts([]); // clear old results

      const page_size = 26;
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
      console.log("including products with allergens: " + includeAllergens);
      if (!includeAllergens) {
        allergens.forEach((a) => {
          params.push(`tagtype_${index}=allergens`);
          params.push(`tag_contains_${index}=does_not_contain`);
          params.push(`tag_${index}=${encodeURIComponent(a)}`);
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

      const json = await response.json();
      const filteredProducts: Product[] = json.products.map((p: any) => ({
        id: p.code,
        title: p.product_name || "Unknown",
        brand: p.brands || "No Brand",
        ingredients: p.ingredients ? getIngredients(p.ingredients) : [],
        image: p.image_front_url || p.image_url || null,
        nutriscore: p.nutriscore_grade || null,
        allergens: p.allergens || [],
        additives: p.additives || [],
        traces: getTraces(p.traces_tags) || [],
        pick: pickCalcuator(getTraces(p.traces_tags) || []) || null,
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


  const pickCalcuator = (traces: string[]) => {
    const found = traces.some((trace: string) =>
      allergens?.includes(trace.toLowerCase()));
    if (found) {
      return "Trace Warning";
    }
    return null;
  }
  //   const tracesArray = Array.isArray(data.traces) // traces 
  //   ? data.traces
  //   : typeof data.traces === "string"
  //     ? data.traces.split(",").map((t: string) => t.trim().toLowerCase())
  //     : [];

  // const found = tracesArray.some((trace: string) =>
  //   allergenList?.includes(trace.toLowerCase()));
  // traces 
  // nutriscore 
  // on item load compare its traces to allergens 


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
                  {item.pick !== null ? (
                    <Ionicons name="warning" size={24} color="#ff5757" style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }} />
                  ) : null}
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={require('../../assets/logos/logo3.png')}
                      style={{ width: 100, height: 100, marginBottom: 8, marginTop: 8, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}
                      resizeMode="contain"
                    />
                  )}
                  <View style={{ marginLeft: 4, alignContent: 'flex-start' }}>
                    <ProductBrand>{item.brand}</ProductBrand>
                    <ProductHeader>{item.title}</ProductHeader>
                    <ProductText>{item.pick}</ProductText>
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





export default ListScreen;
