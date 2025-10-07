import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, Image } from 'react-native';

type Product = {
  id: string;
  title: string;
  brand: string;
  ingredients: string[];
  image?: string | null;
  nutriscore?: string | null;
};

const App = () => {
  const [isLoading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerms, setSearchTerms] = useState("pop tarts");
  // const [additives, setAdditives] = useState<string[]>(["E150d", "E104"]);
  const [allergens, setAllergens] = useState<string[]>(["peanuts", "milk"]);

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

  // useEffect(() => {
  //   getProducts();
  // }, []);

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: 'white' }}>
      <input
        type="text"
        value={searchTerms}
        onChange={(e) => setSearchTerms(e.target.value)}
        placeholder="Search Terms"
        style={{ marginBottom: 12, padding: 8, borderColor: 'gray', borderWidth: 1 }}
      />
      <input
        type="text"
        value={allergens.join(", ")}
        onChange={(e) => setAllergens(e.target.value.split(", ").map(item => item.trim()))}
        placeholder="Allergens"
        style={{ marginBottom: 12, padding: 8, borderColor: 'gray', borderWidth: 1 }}
      />
      {/* <input
        type="text"
        value={additives.join(", ")}
        onChange={(e) => setAdditives(e.target.value.split(", ").map(item => item.trim()))}
        placeholder="Additives"
        style={{ marginBottom: 12, padding: 8, borderColor: 'gray', borderWidth: 1 }}
      /> */}
      <button
        onClick={() => {
          setProducts([]); 
          setLoading(true);
          getProducts();
        }}
        style={{ marginBottom: 12, padding: 8, backgroundColor: 'blue', color: 'white' }}
      >
        Search
      </button>

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View
              style={{
                flex: 1,
                margin: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                backgroundColor: '#fafafa',
                alignItems: 'center',
              }}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 8 }}
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
              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{item.title}</Text>
              <Text style={{ textAlign: 'center' }}>Brand: {item.brand}</Text>
              <Text style={{ textAlign: 'center' }}>Nutriscore: {item.nutriscore}</Text>
            </View>
          )}
        />

      )}
    </View>
  );
};

export default App;
