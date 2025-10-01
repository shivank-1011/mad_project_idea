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
  const { addToComparison } = useComparison();

  // Construct full image URL if it's a relative path or handle external URLs
  const getImageUrl = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith("/assets/")) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    return imageUrl; // Return as-is for external URLs (https://)
  };

  useEffect(() => {
    async function loadItem() {
      const data = await getProductById(productId);
      setItem(data);
    }
    loadItem();
  }, [productId]);

  const addToCompare = () => {
    addToComparison(item);
    Alert.alert(
      "Added to Comparison",
      "Go to Comparison screen to view products."
    );
  };

  const showChart = (history) => {
    if (!history || history.length === 0) return null;
    const dates = history.map((p) => new Date(p.date).toLocaleDateString());
    const prices = history.map((p) => p.price);

    return (
      <LineChart
        data={{ labels: dates, datasets: [{ data: prices }] }}
        width={width - spacing.lg * 2}
        height={200}
        yAxisLabel="₹"
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => colors.text,
          style: { borderRadius: borderRadius.lg },
          propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary },
        }}
        style={styles.chart}
      />
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

            <View style={styles.priceRatingContainer}>
              <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.stars}>{renderStars(item.rating)}</Text>
                <Text style={styles.ratingText}>{item.rating}/5</Text>
              </View>
            </View>
          </View>

          {item.specs && Object.keys(item.specs).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <View style={styles.specsContainer}>
                {Object.keys(item.specs).map((key) => (
                  <View key={key} style={styles.specRow}>
                    <Text style={styles.specKey}>{key}:</Text>
                    <Text style={styles.specValue}>{item.specs[key]}</Text>
                  </View>
                ))}
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
  chart: {
    borderRadius: borderRadius.md,
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
});
