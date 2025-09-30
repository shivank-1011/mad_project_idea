import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/productApi";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Separate states for typing vs. actual search trigger
  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sortOption, setSortOption] = useState("");

  const timeoutRef = useRef(null);

  const fetchProducts = useCallback(async (searchTerm, brand, sort) => {
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm) filters.name = searchTerm;
      if (brand) filters.brand = brand;

      let data = await getProducts(filters);
      if (sort === "priceAsc") data.sort((a, b) => a.price - b.price);
      else if (sort === "priceDesc") data.sort((a, b) => b.price - a.price);
      else if (sort === "ratingDesc") data.sort((a, b) => b.rating - a.rating);

      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts("", "", "");
  }, [fetchProducts]);

  // Debounce search typing
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSearch(searchQuery); // trigger real search
    }, 1500); // 800ms debounce

    return () => clearTimeout(timeoutRef.current);
  }, [searchQuery]);

  // Refetch when search, brand, or sort changes
  useEffect(() => {
    fetchProducts(search, brandFilter, sortOption);
  }, [search, brandFilter, sortOption, fetchProducts]);

  const renderPriceGraph = useCallback((priceHistory) => {
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
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ScrollView style={{ marginBottom: 20 }}>
        <ProductCard
          product={item}
          onPress={() =>
            navigation.navigate("ProductDetail", { productId: item.id })
          }
        />
        {renderPriceGraph(item.priceHistory)}
      </ScrollView>
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Search..."
          value={searchQuery} // only tied to typing
          onChangeText={setSearchQuery} // smooth typing
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          blurOnSubmit={false}
          clearButtonMode="while-editing"
          selectTextOnFocus={true}
        />
        <Picker
          selectedValue={brandFilter}
          onValueChange={setBrandFilter}
          style={styles.picker}
        >
          <Picker.Item label="All Brands" value="" />
          <Picker.Item label="Apple" value="Apple" />
          <Picker.Item label="Samsung" value="Samsung" />
          <Picker.Item label="Vivo" value="Vivo" />
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
      </View>
      <FlatList
        data={products}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

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

export default React.memo(ProductListScreen);
