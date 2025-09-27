import React from "react";
import {
  View,
  ScrollView,
  Text,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { useComparison } from "../context/ComparisonContext";

export default function ComparisonScreen() {
  const { comparisonList, removeFromComparison, clearComparison } =
    useComparison();

  if (comparisonList.length === 0)
    return (
      <Text style={{ padding: 20 }}>No products added for comparison.</Text>
    );

  const attributes = ["name", "brand", "price", "rating"];

  return (
    <ScrollView horizontal style={{ padding: 10 }}>
      <View style={{ flexDirection: "row" }}>
        {attributes.map((attr) => (
          <View key={attr} style={styles.column}>
            <Text style={styles.header}>{attr.toUpperCase()}</Text>
            {comparisonList.map((p) => (
              <View key={p.id} style={{ marginBottom: 10 }}>
                <Text style={styles.cell}>{p[attr]}</Text>
                <Button
                  title="Remove"
                  onPress={() => removeFromComparison(p.id)}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
      <Button
        title="Clear Comparison"
        onPress={() => {
          clearComparison();
          Alert.alert("Comparison cleared");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  column: { marginRight: 20 },
  header: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  cell: { fontSize: 14, marginBottom: 5 },
});
