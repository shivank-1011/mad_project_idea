import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { getProductById } from "../api/productApi";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useComparison } from "../context/ComparisonContext";

const screenWidth = Dimensions.get("window").width;

export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const { addToComparison } = useComparison();

  useEffect(() => {
    async function fetchProduct() {
      const data = await getProductById(productId);
      setProduct(data);
    }
    fetchProduct();
  }, [productId]);

  const handleAddToComparison = () => {
    addToComparison(product);
    Alert.alert(
      "Added to Comparison",
      "Go to Comparison screen to view products."
    );
  };

  const renderPriceGraph = (priceHistory) => {
    if (!priceHistory || priceHistory.length === 0) return null;
    const labels = priceHistory.map((p) =>
      new Date(p.date).toLocaleDateString()
    );
    const data = priceHistory.map((p) => p.price);

    return (
      <LineChart
        data={{ labels, datasets: [{ data }] }}
        width={screenWidth - 40}
        height={200}
        yAxisLabel="₹"
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0,0,255,${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "4", strokeWidth: "1", stroke: "#0000ff" },
        }}
        style={{ marginVertical: 10, borderRadius: 16 }}
      />
    );
  };

  if (!product)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.brand}>Brand: {product.brand}</Text>
      <Text style={styles.price}>Price: ₹{product.price}</Text>
      <Text style={styles.rating}>Rating: {product.rating}</Text>

      <Text style={styles.sectionHeader}>Specifications:</Text>
      {product.specs &&
        Object.keys(product.specs).map((key) => (
          <Text key={key} style={styles.spec}>
            {key}: {product.specs[key]}
          </Text>
        ))}

      <Text style={styles.sectionHeader}>Price History:</Text>
      {renderPriceGraph(product.priceHistory)}

      <View style={styles.buttonContainer}>
        <Button
          title="Buy Now"
          onPress={() => Linking.openURL(product.affiliateLink)}
        />
        <Button title="Add to Comparison" onPress={handleAddToComparison} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  brand: { fontSize: 16, marginBottom: 5 },
  price: { fontSize: 16, marginBottom: 5, color: "green" },
  rating: { fontSize: 16, marginBottom: 10 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  spec: { fontSize: 14, marginBottom: 3 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
