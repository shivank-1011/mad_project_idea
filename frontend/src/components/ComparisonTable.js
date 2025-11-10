import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../styles/theme";

export default function ComparisonTable({ products }) {
  if (products.length < 2)
    return (
      <Text style={styles.noProductsText}>
        Select at least 2 products to compare.
      </Text>
    );


  const specCategories = [
    { key: "name", label: "Product Name", isBasic: true },
    { key: "brand", label: "Brand", isBasic: true },
    {
      key: "price",
      label: "Price (₹)",
      isBasic: true,
      format: (value) => `₹${value?.toLocaleString()}`,
    },
    {
      key: "rating",
      label: "Rating",
      isBasic: true,
      format: (value) => (value ? `${value}/5` : "N/A"),
    },
    { key: "releaseDate", label: "Release Date", isBasic: true },
    { key: "display", label: "Display", isSpec: true },
    { key: "cpu", label: "Processor", isSpec: true },
    { key: "rearCamera", label: "Rear Camera", isSpec: true },
    { key: "frontCamera", label: "Front Camera", isSpec: true },
    { key: "ramAndStorage", label: "RAM & Storage", isSpec: true },
    { key: "batteryAndCharging", label: "Battery & Charging", isSpec: true },
    { key: "operatingSystem", label: "Operating System", isSpec: true },
    { key: "connectivity", label: "Connectivity", isSpec: true },
    { key: "expertView", label: "Expert Review", isBasic: true },
  ];

  const formatValue = (product, spec) => {
    let value;

    if (spec.isBasic) {
      value = product[spec.key];
    } else if (spec.isSpec) {
      value = product.specs?.[spec.key];
    }


    if (spec.format && value) {
      return spec.format(value);
    }


    if (value === null || value === undefined || value === "") {
      return "Not specified";
    }


    if (typeof value === "string" && value.length > 150) {
      return value.substring(0, 150) + "...";
    }

    return value;
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={true}
      bounces={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        bounces={false}
        style={styles.horizontalScroll}
        nestedScrollEnabled={true}
      >
        <View style={styles.table}>
          {}
          <View style={styles.headerRow}>
            <View style={styles.specLabelColumn}>
              <Text style={styles.specLabelHeader}>Specifications</Text>
            </View>
            {products.map((product, index) => (
              <View key={product.id} style={styles.productColumn}>
                <Text style={styles.productHeader} numberOfLines={2}>
                  {product.name}
                </Text>
              </View>
            ))}
          </View>

          {}
          {specCategories.map((spec, specIndex) => (
            <View
              key={spec.key}
              style={[
                styles.specRow,
                specIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}
            >
              <View style={styles.specLabelColumn}>
                <Text style={styles.specLabel}>{spec.label}</Text>
              </View>
              {products.map((product) => (
                <View key={product.id} style={styles.productColumn}>
                  <Text style={styles.specValue} numberOfLines={5}>
                    {formatValue(product, spec)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  horizontalScroll: {
    flex: 1,
  },
  noProductsText: {
    textAlign: "center",
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.massive,
    fontStyle: "italic",
    fontWeight: typography.fontWeight.medium,
  },
  table: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    margin: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: "100%",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#343a40",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  specRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    minHeight: 60,
  },
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#f8f9fa",
  },
  specLabelColumn: {
    width: 160,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
    justifyContent: "center",
    minHeight: 60,
  },
  productColumn: {
    width: 220,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
    justifyContent: "center",
    minHeight: 60,
  },
  specLabelHeader: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
  },
  productHeader: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 18,
  },
  specLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: "#495057",
    textAlign: "left",
  },
  specValue: {
    fontSize: 13,
    color: "#212529",
    textAlign: "left",
    lineHeight: 18,
    flexWrap: "wrap",
  },
});
