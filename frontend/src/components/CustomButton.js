import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import { colors } from "../styles/theme";

export const CustomButton = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return commonStyles.buttonSecondary;
      case "outline":
        return commonStyles.buttonOutline;
      default:
        return commonStyles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return commonStyles.buttonTextSecondary;
      case "outline":
        return commonStyles.buttonTextOutline;
      default:
        return commonStyles.buttonText;
    }
  };

  const buttonOpacity = disabled || loading ? 0.5 : 1;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), { opacity: buttonOpacity }, style]}
      onPress={disabled || loading ? null : onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <View style={commonStyles.row}>
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? colors.surface : colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={[getTextStyle(), textStyle]}>Loading...</Text>
        </View>
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
