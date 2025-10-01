import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../styles/theme";

export default function TestStyleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Style Test</Text>
      <Text style={styles.subtitle}>Modern CSS has been added!</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>This is a styled card component</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.fontSize.heading,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});
