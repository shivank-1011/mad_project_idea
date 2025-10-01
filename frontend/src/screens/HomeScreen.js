import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { commonStyles } from "../styles/commonStyles";
import { colors, spacing, typography } from "../styles/theme";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.title}>SmartShop</Text>
          <Text style={styles.subtitle}>
            Find the best deals with AI-powered recommendations
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Browse Products"
            onPress={() => navigation.navigate("Products")}
            style={styles.primaryButton}
          />
          <CustomButton
            title="AI Recommendations"
            onPress={() => navigation.navigate("Chatbot")}
            variant="secondary"
            style={styles.secondaryButton}
          />
          <CustomButton
            title="Product Comparison"
            onPress={() => navigation.navigate("Comparison")}
            variant="outline"
            style={styles.outlineButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={commonStyles.bodySmall}>
            Compare prices, read reviews, and make informed decisions
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  buttonContainer: {
    width: "100%",
    gap: spacing.md,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    marginBottom: spacing.sm,
  },
  outlineButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
});
