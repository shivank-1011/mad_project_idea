import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { ComparisonProvider } from "./context/ComparisonContext";

export default function App() {
  return (
    <ComparisonProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ComparisonProvider>
  );
}
