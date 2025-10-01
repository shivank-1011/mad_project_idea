import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/productApi";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import { commonStyles } from "../styles/commonStyles";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/theme";

const width = Dimensions.get("window").width;

const ProductListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [typing, setTyping] = useState("");
  const [searchText, setSearchText] = useState("");
  const [brand, setBrand] = useState("");
  const [sortBy, setSortBy] = useState("");

  const timer = useRef(null);

  const loadItems = useCallback(async (search, brandName, sorting) => {
    setIsLoading(true);
    try {
      const filters = {};
      if (search) filters.name = search;
      if (brandName) filters.brand = brandName;

      let data = await getProducts(filters);
      if (sorting === "priceAsc") data.sort((a, b) => a.price - b.price);
      else if (sorting === "priceDesc") data.sort((a, b) => b.price - a.price);
      else if (sorting === "ratingDesc")
        data.sort((a, b) => b.rating - a.rating);

      setItems(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems("", "", "");
  }, [loadItems]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearchText(typing);
    }, 1500);

    return () => clearTimeout(timer.current);
  }, [typing]);

  useEffect(() => {
    loadItems(searchText, brand, sortBy);
  }, [searchText, brand, sortBy, loadItems]);

  const showChart = useCallback((history) => {
    if (!history || history.length === 0) return null;
    const dates = history.map((p) => new Date(p.date).toLocaleDateString());
    const prices = history.map((p) => p.price);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Price History</Text>
        <LineChart
          data={{ labels: dates, datasets: [{ data: prices }] }}
          width={width - spacing.lg * 2}
          height={180}
          yAxisLabel="₹"
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => colors.text,
            style: { borderRadius: borderRadius.lg },
            propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary },
          }}
          style={styles.chart}
        />
      </View>
    );
  }, []);

  const showItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <ProductCard
          product={item}
          onPress={() =>
            navigation.navigate("ProductDetail", { productId: item.id })
          }
        />
        {showChart(item.priceHistory)}
      </View>
    ),
    [navigation, showChart]
  );

  const getKey = useCallback((item) => item.id.toString(), []);

  if (isLoading)
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.columnCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.bodyMedium, styles.loadingText]}>
            Loading products...
          </Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      {/* Fixed Filters (NOT inside FlatList) */}
      <View style={styles.filtersContainer}>
        <TextInput
          placeholder="Search products..."
          value={typing}
          onChangeText={setTyping}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          blurOnSubmit={false}
          clearButtonMode="while-editing"
          selectTextOnFocus={true}
          placeholderTextColor={colors.textTertiary}
        />

        <View style={styles.pickerRow}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={brand}
              onValueChange={setBrand}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="All Brands" value="" />
              <Picker.Item label="Apple" value="Apple" />
              <Picker.Item label="Nothing" value="Nothing" />
              <Picker.Item label="OnePlus" value="OnePlus" />
              <Picker.Item label="Oppo" value="Oppo" />
              <Picker.Item label="Realme" value="Realme" />
              <Picker.Item label="Samsung" value="Samsung" />
              <Picker.Item label="Vivo" value="Vivo" />
              <Picker.Item label="Xiaomi" value="Xiaomi" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortBy}
              onValueChange={setSortBy}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Default" value="" />
              <Picker.Item label="Price Low to High" value="priceAsc" />
              <Picker.Item label="Price High to Low" value="priceDesc" />
              <Picker.Item label="Rating High to Low" value="ratingDesc" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Scrollable product list */}
      <FlatList
        data={items}
        keyExtractor={getKey}
        renderItem={showItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,      // ensures filters float above list
    elevation: 8,     // Android fix
  },
  searchInput: {
    ...commonStyles.input,
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.md,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    zIndex: 101,      // higher than FlatList
  },
  pickerContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 45,
    justifyContent: "center",
    zIndex: 20, // fixes dropdown collapsing under list
    elevation: 5, // Android fix
  },
  picker: {
    height: 45,
    color: colors.text,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  itemContainer: {
    marginBottom: spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    margin: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  chartTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  loadingText: {
    marginTop: spacing.sm,
  },
});

export default React.memo(ProductListScreen);
