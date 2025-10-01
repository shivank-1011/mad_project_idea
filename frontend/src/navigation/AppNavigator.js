import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ComparisonScreen from "../screens/ComparisionScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import { colors, typography } from "../styles/theme";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      fontWeight: "bold",
      fontSize: typography.fontSize.lg,
    },
    contentStyle: {
      backgroundColor: colors.background,
    },
  };

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "SmartShop" }}
      />
      <Stack.Screen
        name="Products"
        component={ProductListScreen}
        options={{ title: "Products" }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product Details" }}
      />
      <Stack.Screen
        name="Comparison"
        component={ComparisonScreen}
        options={{ title: "Compare Products" }}
      />
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: "AI Assistant" }}
      />
    </Stack.Navigator>
  );
}
