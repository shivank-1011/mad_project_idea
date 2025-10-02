import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProductById } from "../api/productApi";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useComparison } from "../context/ComparisonContext";
import { API_BASE_URL } from "../config/api";
import { CustomButton } from "../components/CustomButton";
import { commonStyles } from "../styles/commonStyles";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/theme";

const width = Dimensions.get("window").width;

export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const [item, setItem] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [chartScrollX, setChartScrollX] = useState(0);
  const [showZoomControls, setShowZoomControls] = useState(false);
  const { addToComparison } = useComparison();

  // Construct full image URL if it's a relative path or handle external URLs
  const getImageUrl = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith("/assets/")) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    return imageUrl; // Return as-is for external URLs (https://)
  };

  // Render specifications with user-friendly labels
  const renderSpecifications = (specs) => {
    const specLabels = {
      display: "Display",
      cpu: "Processor",
      rearCamera: "Rear Camera",
      frontCamera: "Front Camera",
      ramAndStorage: "RAM & Storage",
      batteryAndCharging: "Battery & Charging",
      operatingSystem: "Operating System",
      connectivity: "Connectivity Features",
    };

    const specOrder = [
      "display",
      "cpu",
      "rearCamera",
      "frontCamera",
      "ramAndStorage",
      "batteryAndCharging",
      "operatingSystem",
      "connectivity",
    ];

    return specOrder
      .map((key) => {
        if (
          specs[key] &&
          specs[key] !== "Not specified" &&
          specs[key].trim() !== ""
        ) {
          return (
            <View key={key} style={styles.specRow}>
              <Text style={styles.specKey}>{specLabels[key]}:</Text>
              <Text style={styles.specValue}>{specs[key]}</Text>
            </View>
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  const loadItem = async () => {
    try {
      setIsRefreshing(true);
      const data = await getProductById(productId);
      setItem(data);
    } catch (error) {
      console.error("Error loading product:", error);
      Alert.alert("Error", "Failed to load product details");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [productId]);

  const addToCompare = () => {
    addToComparison(item);
    Alert.alert(
      "Added to Comparison",
      "Go to Comparison screen to view products."
    );
  };

  // Zoom control functions
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel((prev) => prev + 0.5);
      setShowZoomControls(true);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel((prev) => prev - 0.5);
      if (zoomLevel <= 1) {
        setShowZoomControls(false);
        setChartScrollX(0);
      }
    }
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setChartScrollX(0);
    setShowZoomControls(false);
  };

  const handleChartScroll = (event) => {
    setChartScrollX(event.nativeEvent.contentOffset.x);
  };

  const showChart = (history) => {
    console.log("Price history data:", history); // Debug log

    if (!history || history.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Price history data is being fetched from Smartprix...
          </Text>
          <Text style={styles.noDataSubText}>
            Tap "Refresh Price History" below to update the data.
          </Text>
          <CustomButton
            title={isRefreshing ? "Loading..." : "Refresh Price History"}
            onPress={loadItem}
            disabled={isRefreshing}
            style={styles.refreshButton}
          />
        </View>
      );
    }

    // Sort history by date to ensure proper chronological order
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const dates = sortedHistory.map((p) => {
      const date = new Date(p.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const prices = sortedHistory.map((p) => p.price);

    // Ensure we have valid price data
    if (prices.some((price) => isNaN(price) || price <= 0)) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Invalid price data</Text>
        </View>
      );
    }

    const chartWidth = (width - spacing.lg * 2) * zoomLevel;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;

    return (
      <View style={styles.chartWrapper}>
        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            onPress={handleZoomOut}
            style={[styles.zoomButton, { opacity: zoomLevel > 0.5 ? 1 : 0.5 }]}
            disabled={zoomLevel <= 0.5}
          >
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleZoomReset}
            style={[styles.zoomButton, styles.resetButton]}
          >
            <Text style={styles.resetButtonText}>⌂</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleZoomIn}
            style={[styles.zoomButton, { opacity: zoomLevel < 3 ? 1 : 0.5 }]}
            disabled={zoomLevel >= 3}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Chart Container with Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          onScroll={handleChartScroll}
          scrollEventThrottle={16}
          style={styles.chartScrollContainer}
          contentContainerStyle={{
            paddingHorizontal: zoomLevel > 1 ? spacing.lg : 0,
          }}
        >
          <LineChart
            data={{
              labels: dates,
              datasets: [
                {
                  data: prices,
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={chartWidth}
            height={220}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => colors.text,
              style: { borderRadius: borderRadius.lg },
              propsForDots: {
                r: Math.max(2, 4 / zoomLevel),
                strokeWidth: "2",
                stroke: colors.primary,
              },
              formatYLabel: (value) => {
                if (value >= 100000) {
                  return `₹${(value / 100000).toFixed(1)}L`;
                } else if (value >= 1000) {
                  return `₹${(value / 1000).toFixed(0)}K`;
                }
                return `₹${value}`;
              },
            }}
            style={styles.chart}
            bezier
            withDots={true}
            withShadow={false}
            withInnerLines={zoomLevel <= 1.5}
            withOuterLines={true}
            onDataPointClick={(data) => {
              const selectedPrice = prices[data.index];
              const selectedDate = dates[data.index];
              Alert.alert(
                "Price Details",
                `Date: ${selectedDate}\nPrice: ₹${selectedPrice.toLocaleString()}`,
                [{ text: "OK" }]
              );
            }}
          />
        </ScrollView>

        {/* Zoom Level Indicator */}
        {zoomLevel !== 1 && (
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomIndicatorText}>
              {zoomLevel.toFixed(1)}x
            </Text>
          </View>
        )}

        {/* Price Range Info */}
        <View style={styles.priceRangeInfo}>
          <Text style={styles.priceRangeText}>
            Range: ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
          </Text>
          <Text style={styles.priceVariationText}>
            Variation: ₹{priceRange.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  if (!item)
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.columnCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.bodyMedium, { marginTop: spacing.sm }]}>
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push("★");
    }
    if (hasHalfStar) {
      stars.push("☆");
    }
    while (stars.length < 5) {
      stars.push("☆");
    }

    return stars.join("");
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={styles.main}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(item.imageUrl) }}
            style={styles.productImage}
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.brand}>{item.brand}</Text>

            {/* Additional phone information */}
            <View style={styles.phoneInfoSection}>
              {item.releaseDate && (
                <Text style={styles.phoneInfo}>📅 {item.releaseDate}</Text>
              )}
              {item.totalRatings && (
                <Text style={styles.phoneInfo}>⭐ {item.totalRatings}</Text>
              )}
            </View>

            <View style={styles.priceRatingContainer}>
              <View style={styles.priceSection}>
                {item.realTimePrice && item.realTimePrice !== item.price ? (
                  <>
                    <View style={styles.realTimePriceContainer}>
                      <Text style={styles.realTimePrice}>
                        ₹{item.realTimePrice.toLocaleString()}
                      </Text>
                      <View style={styles.priceSourceBadge}>
                        <Text style={styles.priceSourceText}>
                          {item.cheapestSource === "amazon"
                            ? "📦 Amazon"
                            : item.cheapestSource === "flipkart"
                            ? "🛒 Flipkart"
                            : "💰 Live"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.originalPrice}>
                      ₹{item.price.toLocaleString()}
                    </Text>
                    {item.realTimePrice < item.price && (
                      <Text style={styles.savingsText}>
                        Save ₹
                        {(item.price - item.realTimePrice).toLocaleString()}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.price}>
                    ₹{item.price.toLocaleString()}
                  </Text>
                )}
                {item.lastPriceUpdate && (
                  <Text style={styles.lastUpdateText}>
                    Updated:{" "}
                    {new Date(item.lastPriceUpdate).toLocaleTimeString()}
                  </Text>
                )}
              </View>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.stars}>{renderStars(item.rating)}</Text>
                  <Text style={styles.ratingText}>{item.rating}/5</Text>
                </View>
              )}
            </View>
          </View>

          {item.specs && Object.keys(item.specs).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <View style={styles.specsContainer}>
                {renderSpecifications(item.specs)}
              </View>
            </View>
          )}

          {/* Expert Review Section */}
          {item.expertView && item.expertView.trim() !== "" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expert Review</Text>
              <View style={styles.expertReviewContainer}>
                <Text style={styles.expertReviewText}>{item.expertView}</Text>
              </View>
            </View>
          )}

          {item.priceComparison &&
            Object.keys(item.priceComparison).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Price Comparison</Text>
                <View style={styles.priceComparisonContainer}>
                  {Object.entries(item.priceComparison).map(
                    ([source, priceData]) => (
                      <TouchableOpacity
                        key={source}
                        style={[
                          styles.priceCard,
                          item.cheapestSource === source &&
                            styles.cheapestPriceCard,
                        ]}
                        onPress={() =>
                          priceData.url && Linking.openURL(priceData.url)
                        }
                      >
                        <View style={styles.priceCardHeader}>
                          <Text style={styles.priceCardSource}>
                            {source === "amazon"
                              ? "📦 Amazon"
                              : source === "flipkart"
                              ? "🛒 Flipkart"
                              : source}
                          </Text>
                          {item.cheapestSource === source && (
                            <View style={styles.bestDealBadge}>
                              <Text style={styles.bestDealText}>Best Deal</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.priceCardPrice}>
                          ₹{priceData.price.toLocaleString()}
                        </Text>
                        {priceData.url && (
                          <Text style={styles.priceCardLink}>
                            Tap to view →
                          </Text>
                        )}
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price History</Text>
            <View style={styles.chartContainer}>
              {showChart(item.priceHistory)}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Buy Now"
          onPress={() => Linking.openURL(item.affiliateLink)}
          style={styles.buyButton}
        />
        <CustomButton
          title="Add to Comparison"
          onPress={addToCompare}
          variant="secondary"
          style={styles.compareButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed buttons
  },
  imageContainer: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: width - spacing.lg * 2,
    height: 300,
    resizeMode: "contain",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
  },
  brand: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.medium,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  priceSection: {
    flex: 1,
  },
  realTimePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  realTimePrice: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  priceSourceBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  priceSourceText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  originalPrice: {
    fontSize: typography.fontSize.lg,
    textDecorationLine: "line-through",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  savingsText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  lastUpdateText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontStyle: "italic",
  },
  priceComparisonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  priceCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cheapestPriceCard: {
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: colors.successLight || colors.surfaceSecondary,
  },
  priceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  priceCardSource: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  bestDealBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  bestDealText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  priceCardPrice: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  priceCardLink: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  ratingContainer: {
    alignItems: "flex-end",
  },
  stars: {
    fontSize: typography.fontSize.lg,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  specsContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  specRow: {
    flexDirection: "row",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  specKey: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  specValue: {
    flex: 2,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  chartContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  chartWrapper: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  zoomControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  zoomButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },
  resetButton: {
    backgroundColor: colors.textSecondary,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  zoomButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  resetButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  chartScrollContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  zoomIndicator: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  zoomIndicatorText: {
    color: colors.surface,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  priceRangeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceRangeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  priceVariationText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  noDataContainer: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  noDataText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  noDataSubText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  refreshButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    gap: spacing.md,
    ...shadows.lg,
  },
  buyButton: {
    flex: 1,
  },
  compareButton: {
    flex: 1,
  },
  phoneInfoSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  phoneInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  expertReviewContainer: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  expertReviewText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    fontStyle: "italic",
  },
});
