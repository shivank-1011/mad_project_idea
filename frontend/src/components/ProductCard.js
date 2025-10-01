import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { API_BASE_URL } from "../config/api";
import { commonStyles } from "../styles/commonStyles";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/theme";

export default function ProductCard({ product, onPress }) {
  // Construct full image URL if it's a relative path or handle external URLs
  const getImageUrl = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith("/assets/")) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    return imageUrl; // Return as-is for external URLs (https://)
  };

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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl(product.imageUrl) }}
          style={styles.productImage}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.brand}>{product.brand}</Text>

        <View style={styles.priceRatingContainer}>
          <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.stars}>{renderStars(product.rating)}</Text>
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    overflow: "hidden",
    ...shadows.md,
  },
  imageContainer: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    height: 180,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.md * typography.lineHeight.tight,
  },
  brand: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
