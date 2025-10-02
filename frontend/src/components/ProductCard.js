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

export default function PhoneCard({ product, onPress }) {
  const getImage = (url) => {
    if (url && url.startsWith("/assets/")) {
      return `${API_BASE_URL}${url}`;
    }
    return url;
  };

  const showStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;

    for (let i = 0; i < full; i++) {
      stars.push("★");
    }
    if (half) {
      stars.push("☆");
    }
    while (stars.length < 5) {
      stars.push("☆");
    }

    return stars.join("");
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.image}>
        <Image
          source={{ uri: getImage(product.imageUrl) }}
          style={styles.photo}
        />
        <View style={styles.overlay} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.brand}>{product.brand}</Text>

        <View style={styles.bottom}>
          <View style={styles.price}>
            {product.realTimePrice &&
            product.realTimePrice !== product.price ? (
              <>
                <View style={styles.live}>
                  <Text style={styles.current}>
                    ₹{product.realTimePrice.toLocaleString()}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.source}>
                      {product.cheapestSource === "amazon"
                        ? "AMZ"
                        : product.cheapestSource === "flipkart"
                        ? "FK"
                        : "LIVE"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.old}>
                  ₹{product.price.toLocaleString()}
                </Text>
                {product.realTimePrice < product.price && (
                  <Text style={styles.save}>
                    Save ₹
                    {(product.price - product.realTimePrice).toLocaleString()}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.cost}>
                {(product.realTimePrice && product.realTimePrice > 0) ||
                product.price > 0
                  ? `₹${(product.realTimePrice && product.realTimePrice > 0
                      ? product.realTimePrice
                      : product.price
                    ).toLocaleString()}`
                  : "Price not available"}
              </Text>
            )}
          </View>
          {product.rating && (
            <View style={styles.rating}>
              <Text style={styles.stars}>{showStars(product.rating)}</Text>
              <Text style={styles.score}>{product.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  image: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    position: "relative",
  },
  photo: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    opacity: 0,
  },
  info: {
    padding: spacing.lg,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.lg * typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.normal,
  },
  brand: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    flex: 1,
  },
  cost: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  live: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  current: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  source: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  old: {
    fontSize: typography.fontSize.sm,
    textDecorationLine: "line-through",
    color: colors.textSecondary,
    marginBottom: 2,
  },
  save: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    marginRight: spacing.xs,
  },
  score: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
