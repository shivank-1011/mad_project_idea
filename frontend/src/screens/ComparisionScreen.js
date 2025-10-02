import React from "react";
import { View, ScrollView, Text, StyleSheet, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComparison } from "../context/ComparisonContext";
import { CustomButton } from "../components/CustomButton";
import { commonStyles } from "../styles/commonStyles";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/theme";
import { API_BASE_URL } from "../config/api";

export default function ComparisonScreen() {
  const { comparisonList, removeFromComparison, clearComparison } =
    useComparison();

  const getImageUrl = (imageUrl) => {
    // If no URL or invalid URL, use default 16pm.png
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      return `${API_BASE_URL}/assets/16pm.png`;
    }
    if (imageUrl.startsWith("/assets/")) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    // For external URLs, return as-is, but if they fail to load, fallback will handle it
    return imageUrl;
  };

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

  if (comparisonList.length === 0) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Products to Compare</Text>
          <Text style={styles.emptySubtitle}>
            Add products from the product list to start comparing them.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Comparison</Text>
        <Text style={styles.headerSubtitle}>
          {comparisonList.length} product
          {comparisonList.length !== 1 ? "s" : ""} selected
        </Text>
      </View>

      <ScrollView
        style={styles.mainScrollContainer}
        showsVerticalScrollIndicator={true}
      >
        <ScrollView
          horizontal
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.tableContainer}>
            {/* Headers Row */}
            <View style={styles.headerRow}>
              <View style={styles.labelColumn}>
                <Text style={styles.fieldLabel}></Text>
              </View>
              {comparisonList.map((item) => (
                <View key={item.id} style={styles.productColumn}>
                  <View style={styles.productHeader}>
                    <Image
                      source={{ uri: getImageUrl(item.imageUrl) }}
                      style={styles.productImage}
                      onError={() => {
                        // If image fails to load, the getImageUrl function already provides fallback
                        // This is mainly for external URLs that might fail
                      }}
                    />
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <CustomButton
                      title="Remove"
                      onPress={() => removeFromComparison(item.id)}
                      variant="outline"
                      style={styles.removeButton}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Data Rows */}
            <View style={styles.dataRow}>
              <View style={styles.labelColumn}>
                <Text style={styles.fieldLabel}>Brand</Text>
              </View>
              {comparisonList.map((item) => (
                <View key={item.id} style={styles.productColumn}>
                  <Text style={styles.fieldValue}>{item.brand}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.dataRow, styles.alternateRow]}>
              <View style={styles.labelColumn}>
                <Text style={styles.fieldLabel}>Price</Text>
              </View>
              {comparisonList.map((item) => (
                <View key={item.id} style={styles.productColumn}>
                  <Text style={[styles.fieldValue, styles.priceText]}>
                    ₹{item.price.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.dataRow}>
              <View style={styles.labelColumn}>
                <Text style={styles.fieldLabel}>Rating</Text>
              </View>
              {comparisonList.map((item) => (
                <View key={item.id} style={styles.productColumn}>
                  <Text style={styles.starsText}>
                    {renderStars(item.rating)}
                  </Text>
                  <Text style={styles.ratingValue}>{item.rating}/5</Text>
                </View>
              ))}
            </View>

            {/* Specifications */}
            {comparisonList.length > 0 &&
              comparisonList[0].specs &&
              Object.keys(comparisonList[0].specs).map((specKey, index) => (
                <View
                  key={specKey}
                  style={[
                    styles.dataRow,
                    index % 2 === 1 ? styles.alternateRow : null,
                  ]}
                >
                  <View style={styles.labelColumn}>
                    <Text style={styles.fieldLabel}>{specKey}</Text>
                  </View>
                  {comparisonList.map((item) => (
                    <View key={item.id} style={styles.productColumn}>
                      <Text style={styles.fieldValue}>
                        {item.specs[specKey] || "N/A"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
          </View>
        </ScrollView>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Clear All"
          onPress={() => {
            clearComparison();
            Alert.alert("Success", "Comparison cleared");
          }}
          variant="outline"
          style={styles.clearButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  mainScrollContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  tableContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.md,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSecondary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: 60,
    alignItems: "center",
  },
  alternateRow: {
    backgroundColor: colors.surfaceSecondary,
  },
  labelColumn: {
    width: 120,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: "center",
  },
  productColumn: {
    width: 180,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  productHeader: {
    alignItems: "center",
    padding: spacing.md,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: spacing.sm,
  },
  productName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
  },
  removeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  fieldValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: "center",
  },
  priceText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  starsText: {
    fontSize: typography.fontSize.md,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  ratingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
  },
});
