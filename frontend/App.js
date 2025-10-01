import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { ComparisonProvider } from "./src/context/ComparisonContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <ComparisonProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ComparisonProvider>
    </SafeAreaProvider>
  );
}
