import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

type Product = {
  id: string;
  title: string;
  brand: string;
  ingredients: string[];
};

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const getProducts = async () => {
    try {
      const response = await fetch(
        'https://world.openfoodfacts.net/api/v2/product/5059320000424.json',
        {
          method: 'GET',
          headers: { Authorization: 'Basic ' + btoa('off:off') },
        }
      );
      const json = await response.json();

      let filteredProduct: Product = {
        id: json.product.code, // ✅ FIX
        title: json.product.product_name || 'Unknown',
        brand: json.product.brands || 'Unknown',
        ingredients: json.product.ingredients
          ? getIngredients(json.product.ingredients)
          : [],
      };

      console.log('Filtered product:', filteredProduct);
      setProducts(prev => [...prev, filteredProduct]);
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

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: 'white' }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>Brand: {item.brand}</Text>
              <Text>Ingredients: {item.ingredients.join(', ')}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default App;
