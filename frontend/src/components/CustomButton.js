import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Animated,
} from "react-native";
import { commonStyles } from "../styles/commonStyles";
import { colors, shadows } from "../styles/theme";

export const CustomButton = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  gradient = false,
  style,
  textStyle,
  ...props
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const getStyle = () => {
    switch (variant) {
      case "secondary":
        return commonStyles.buttonSecondary;
      case "outline":
        return commonStyles.buttonOutline;
      case "ghost":
        return {
          backgroundColor: colors.overlay,
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 20,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 44,
        };
      default:
        return commonStyles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return commonStyles.buttonTextSecondary;
      case "outline":
        return { ...commonStyles.buttonTextSecondary, color: colors.primary };
      case "ghost":
        return { ...commonStyles.buttonText, color: colors.text };
      default:
        return commonStyles.buttonTextPrimary;
    }
  };

  const opacity = disabled || loading ? 0.6 : 1;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const Content = () => (
    <>
      {loading ? (
        <View style={commonStyles.row}>
          <ActivityIndicator
            size="small"
            color={
              variant === "primary" || gradient
                ? colors.textInverse
                : colors.primary
            }
            style={{ marginRight: 8 }}
          />
          <Text style={[getTextStyle(), textStyle]}>Loading...</Text>
        </View>
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </>
  );

  if (gradient && variant === "primary") {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={disabled || loading ? null : onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
          {...props}
        >
          <View
            style={[
              {
                backgroundColor: colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 52,
                opacity,
                ...shadows.glow,
              },
              style,
            ]}
          >
            <Content />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[getStyle(), { opacity }, style]}
        onPress={disabled || loading ? null : onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        <Content />
      </TouchableOpacity>
    </Animated.View>
  );
};
