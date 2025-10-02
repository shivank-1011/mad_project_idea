import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { commonStyles } from "../styles/commonStyles";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../styles/theme";

export default function Home({ navigation }) {
  return (
    <View style={styles.main}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>
            <View style={styles.hero}>
              <View style={styles.top}>
                <Text style={styles.title}>SpecSnap</Text>
                <View style={styles.line} />
              </View>
              <Text style={styles.subtitle}>
                Find the best deals with AI-powered recommendations
              </Text>
              <View style={styles.features}>
                <Text style={styles.text}>
                  ✨ Smart Price Comparison • 🤖 AI Recommendations • 📱
                  Real-time Updates
                </Text>
              </View>
            </View>

            <View style={styles.buttons}>
              <CustomButton
                title="Browse Products"
                onPress={() => navigation.navigate("Products")}
                style={styles.primary}
              />
              <CustomButton
                title="AI Recommendations"
                onPress={() => navigation.navigate("Chatbot")}
                variant="secondary"
                style={styles.secondary}
              />
              <CustomButton
                title="Product Comparison"
                onPress={() => navigation.navigate("Comparison")}
                variant="outline"
                style={styles.outline}
              />
            </View>

            <View style={styles.stats}>
              <View style={styles.item}>
                <Text style={styles.number}>10K+</Text>
                <Text style={styles.label}>Products</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.item}>
                <Text style={styles.number}>5K+</Text>
                <Text style={styles.label}>Happy Users</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.item}>
                <Text style={styles.number}>24/7</Text>
                <Text style={styles.label}>Price Updates</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.info}>
                Compare prices, read reviews, and make informed decisions with
                confidence
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.massive,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.massive,
  },
  top: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.hero,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary,
    textAlign: "center",
    letterSpacing: typography.letterSpacing.tight,
  },
  line: {
    width: 80,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  features: {
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: "center",
    fontWeight: typography.fontWeight.medium,
  },
  buttons: {
    width: "100%",
    gap: spacing.lg,
    marginBottom: spacing.massive,
  },
  primary: {
    marginBottom: spacing.xs,
  },
  secondary: {
    marginBottom: spacing.xs,
  },
  outline: {
    marginBottom: spacing.xs,
  },
  stats: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  number: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.tight,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  info: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
    textAlign: "center",
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },
});
