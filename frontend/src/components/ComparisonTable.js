import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function ComparisonTable({ products }) {
    if (products.length < 2) return <Text>Select at least 2 products to compare.</Text>;

    const attributes = ['name', 'brand', 'price', 'rating'];

    return (
        <ScrollView horizontal>
            <View style={styles.table}>
                {attributes.map(attr => (
                    <View key={attr} style={styles.column}>
                        <Text style={styles.header}>{attr.toUpperCase()}</Text>
                        {products.map(p => (
                            <Text key={p.id} style={styles.cell}>{p[attr]}</Text>
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    table: { flexDirection: 'row' },
    column: { margin: 10 },
    header: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    cell: { fontSize: 14, marginBottom: 3 },
});

