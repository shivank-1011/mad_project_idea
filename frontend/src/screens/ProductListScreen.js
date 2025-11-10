import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneCard from "../components/ProductCard";
import { getProducts } from "../api/productApi";
import { LineChart } from "react-native-chart-kit";
import { commonStyles } from "../styles/commonStyles";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/theme";

const screenWidth = Dimensions.get("window").width;

const ProductList = ({ navigation }) => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userInput, setUserInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortType, setSortType] = useState("releaseDateDesc");

  const searchTimer = useRef(null);

  const loadPhones = useCallback(async (searchTerm, brand, sort) => {
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm) filters.name = searchTerm;
      if (brand) filters.brand = brand;

      let data = await getProducts(filters);
      if (sort === "priceAsc") {
        data.sort((a, b) => {
          const priceA =
            a.realTimePrice && a.realTimePrice > 0 ? a.realTimePrice : a.price;
          const priceB =
            b.realTimePrice && b.realTimePrice > 0 ? b.realTimePrice : b.price;

          if (priceA <= 0 && priceB > 0) return 1;
          if (priceB <= 0 && priceA > 0) return -1;
          if (priceA <= 0 && priceB <= 0) return 0;

          return priceA - priceB;
        });
      } else if (sort === "priceDesc") {
        data.sort((a, b) => {
          const priceA =
            a.realTimePrice && a.realTimePrice > 0 ? a.realTimePrice : a.price;
          const priceB =
            b.realTimePrice && b.realTimePrice > 0 ? b.realTimePrice : b.price;

          if (priceA <= 0 && priceB > 0) return 1;
          if (priceB <= 0 && priceA > 0) return -1;
          if (priceA <= 0 && priceB <= 0) return 0;

          return priceB - priceA;
        });
      } else if (sort === "ratingDesc") {
        data.sort((a, b) => b.rating - a.rating);
      } else if (sort === "releaseDateDesc") {
        data.sort((a, b) => {
          const parseDate = (dateString) => {
            if (!dateString) return new Date(0);
            const match = dateString.match(/Release:\s*(\d+)\s+(\w+),\s*(\d+)/);
            if (!match) return new Date(0);
            const [, day, month, year] = match;
            const months = {
              Jan: 0,
              Feb: 1,
              Mar: 2,
              Apr: 3,
              May: 4,
              Jun: 5,
              Jul: 6,
              Aug: 7,
              Sep: 8,
              Oct: 9,
              Nov: 10,
              Dec: 11,
            };
            return new Date(parseInt(year), months[month] || 0, parseInt(day));
          };

          const dateA = parseDate(a.releaseDate);
          const dateB = parseDate(b.releaseDate);

          return dateB - dateA;
        });
      }

      setPhones(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhones("", "", "releaseDateDesc");
  }, [loadPhones]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(userInput);
    }, 1500);

    return () => clearTimeout(searchTimer.current);
  }, [userInput]);

  useEffect(() => {
    loadPhones(search, selectedBrand, sortType);
  }, [search, selectedBrand, sortType, loadPhones]);

  const renderChart = useCallback((history) => {
    if (!history || history.length === 0) return null;
    const dates = history.map((p) => new Date(p.date).toLocaleDateString());
    const prices = history.map((p) => p.price);

    return (
      <View style={styles.chart}>
        <Text style={styles.title}>Price History</Text>
        <LineChart
          data={{ labels: dates, datasets: [{ data: prices }] }}
          width={screenWidth - spacing.lg * 2}
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
          style={styles.graph}
        />
      </View>
    );
  }, []);

  const renderPhone = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <PhoneCard
          product={item}
          onPress={() =>
            navigation.navigate("ProductDetail", { productId: item.id })
          }
        />
        {item.priceHistory && item.priceHistory.length > 0 && (
          <View style={styles.chart}>
            <Text style={styles.title}>📈 Price Trend</Text>
            {renderChart(item.priceHistory)}
          </View>
        )}
      </View>
    ),
    [navigation, renderChart]
  );

  const getKey = useCallback((item) => item.id.toString(), []);

  if (loading)
    return (
      <View style={styles.main}>
        <SafeAreaView style={styles.safe}>
          <View style={[commonStyles.center, { flex: 1 }]}>
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.text}>
                🔍 Discovering amazing products...
              </Text>
              <Text style={styles.subtext}>Finding the best deals for you</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );

  return (
    <View style={styles.main}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.top}>
            <Text style={styles.title}>📱 SpecSnap</Text>
            <View style={styles.stats}>
              <Text style={styles.count}>{phones.length} products</Text>
            </View>
          </View>

          <View style={styles.searchBox}>
            <View style={styles.input}>
              <Text style={styles.icon}>🔍</Text>
              <TextInput
                placeholder="What are you looking for?"
                value={userInput}
                onChangeText={setUserInput}
                style={styles.field}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                blurOnSubmit={false}
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>
        </View>

        <View style={styles.filters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pills}
          >
            <TouchableOpacity
              style={[styles.pill, selectedBrand === "" && styles.active]}
              onPress={() => setSelectedBrand("")}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedBrand === "" && styles.activeText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {["Apple", "Samsung", "OnePlus", "Xiaomi", "Google", "POCO"].map(
              (brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.pill,
                    selectedBrand === brand && styles.active,
                  ]}
                  onPress={() =>
                    setSelectedBrand(selectedBrand === brand ? "" : brand)
                  }
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedBrand === brand && styles.activeText,
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        <View style={styles.sort}>
          <View style={styles.box}>
            <Text style={styles.label}>Sort by:</Text>
            <View style={styles.options}>
              {[
                { label: "🗓️ Latest", value: "releaseDateDesc" },
                { label: "💰 Price ↑", value: "priceAsc" },
                { label: "💰 Price ↓", value: "priceDesc" },
                { label: "⭐ Rating", value: "ratingDesc" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    sortType === option.value && styles.selected,
                  ]}
                  onPress={() => setSortType(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      sortType === option.value && styles.selectedText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <FlatList
          data={phones}
          keyExtractor={getKey}
          renderItem={renderPhone}
          removeClippedSubviews={true}
          maxToRenderPerBatch={8}
          windowSize={8}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          style={styles.list}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  safe: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxs,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  stats: {
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  count: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  searchBox: {
    marginBottom: spacing.xs,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  icon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.md,
    opacity: 0.7,
  },
  field: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },

  filters: {
    marginBottom: spacing.md,
  },
  pills: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  activeText: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },
  sort: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  box: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  selectedText: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },

  list: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  item: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    overflow: "hidden",
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chart: {
    backgroundColor: colors.backgroundSecondary,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  graph: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  loader: {
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    borderRadius: borderRadius.xxl,
    alignItems: "center",
    marginHorizontal: spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  text: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  subtext: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default React.memo(ProductList);
