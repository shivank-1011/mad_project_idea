import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { ComparisonProvider } from "./src/context/ComparisonContext";

export default function App() {
  return (
    <ComparisonProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ComparisonProvider>
  );
}
