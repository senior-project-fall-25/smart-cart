import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Camera, useCameraPermissions, CameraType, BarcodeScanningResult, CameraView } from 'expo-camera';
import { getUser } from '../Database/requests';
import { useFocusEffect, useRouter } from 'expo-router';

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

export default function Scanner() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [user,setUser] = useState(null)
  const router = useRouter();
  const scannedRef = useRef(false);

  useEffect(() => {
      const fetchUser = async () => {
        await getUser(setLoading, setUser, setAllergens);
      };
      fetchUser();
    }, []);


   useFocusEffect(
    React.useCallback(() => {
      scannedRef.current = false;
    }, [])
  );

  

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

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

  const toggleCameraFacing = () => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scannedRef.current) return; // ignore duplicates
    scannedRef.current = true;  
    setLoading(true);

    try {
      const barcode = result.data;

      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {

        const p = data.product;

        const product = {
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

          };

          //setProductData(data.product);
          router.push({
            pathname: '/Details',
            params: {
              product: encodeURIComponent(JSON.stringify(product)),
              allergens: encodeURIComponent(JSON.stringify(allergens)),
            },
          })

      } else {
        setProductData({ product_name: 'Product not found' });
      }
    } catch (error) {
      console.error(error);
      setProductData({ product_name: 'Error fetching product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'upc_a', 'upc_e', 'code128', 'qr'],
        }}
      />

      <Button title="Flip Camera" onPress={toggleCameraFacing} />

      {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 16 }} />}

      {scanned && productData && (
        <ScrollView style={styles.result}>
          <Text style={styles.title}>Product Info:</Text>
          {Object.entries(productData).map(([key, value]) => (
            <Text key={key} style={styles.text}>
              {key}: {JSON.stringify(value)}
            </Text>
          ))}
          <Button title="Scan Again" onPress={() => { setScanned(false); setProductData(null); }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  message: { textAlign: 'center', padding: 10 },
  result: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  text: { marginBottom: 4 },
});