import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "./theme";

export const commonStyles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: spacing.xl,
  },


  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    ...shadows.card,
  },

  cardLarge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginVertical: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },


  headingLarge: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.fontSize.heading * typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.md,
  },

  headingMedium: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.fontSize.xxl * typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.md,
  },

  headingSmall: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.sm,
  },

  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text,
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },

  bodyMedium: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    color: colors.text,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },

  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },


  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    ...shadows.md,
  },

  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    ...shadows.sm,
  },

  buttonOutline: {
    backgroundColor: "transparent",
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },

  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
    letterSpacing: typography.letterSpacing.normal,
  },

  buttonTextPrimary: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
    textAlign: "center",
    letterSpacing: typography.letterSpacing.normal,
  },

  buttonTextSecondary: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    textAlign: "center",
    letterSpacing: typography.letterSpacing.normal,
  },


  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },


  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },

  priceSymbol: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  priceAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.tight,
  },


  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingStars: {
    fontSize: typography.fontSize.md,
    color: colors.warning,
    marginRight: spacing.xs,
  },

  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});
