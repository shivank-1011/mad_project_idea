import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
} from "react-native";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/productApi";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search, brandFilter, sortOption]);

  const fetchProducts = async () => {
    setLoading(true);
    const filters = {};
    if (search) filters.name = search;
    if (brandFilter) filters.brand = brandFilter;

    let data = await getProducts(filters);
    if (sortOption === "priceAsc") data.sort((a, b) => a.price - b.price);
    else if (sortOption === "priceDesc") data.sort((a, b) => b.price - a.price);
    else if (sortOption === "ratingDesc")
      data.sort((a, b) => b.rating - a.rating);

    setProducts(data);
    setLoading(false);
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

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
        <Picker
          selectedValue={brandFilter}
          onValueChange={setBrandFilter}
          style={styles.picker}
        >
          <Picker.Item label="All Brands" value="" />
          <Picker.Item label="Apple" value="Apple" />
          <Picker.Item label="Samsung" value="Samsung" />
          <Picker.Item label="OnePlus" value="OnePlus" />
        </Picker>
        <Picker
          selectedValue={sortOption}
          onValueChange={setSortOption}
          style={styles.picker}
        >
          <Picker.Item label="Sort By" value="" />
          <Picker.Item label="Price Low to High" value="priceAsc" />
          <Picker.Item label="Price High to Low" value="priceDesc" />
          <Picker.Item label="Rating High to Low" value="ratingDesc" />
        </Picker>
        <Button title="Apply" onPress={fetchProducts} />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ScrollView style={{ marginBottom: 20 }}>
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item.id })
              }
            />
            {renderPriceGraph(item.priceHistory)}
          </ScrollView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: { padding: 10, backgroundColor: "#f2f2f2" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  picker: { marginBottom: 10 },
});
