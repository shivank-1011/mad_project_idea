import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ product, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.rating}>Rating: {product.rating}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { padding: 10, margin: 10, borderWidth: 1, borderRadius: 8, borderColor: '#ccc' },
    image: { width: '100%', height: 150, resizeMode: 'contain' },
    name: { fontWeight: 'bold', fontSize: 16 },
    brand: { fontSize: 14, color: '#555' },
    price: { fontSize: 14, color: '#000' },
    rating: { fontSize: 12, color: '#888' },
});

