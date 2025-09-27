import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Button title="Browse Products" onPress={() => navigation.navigate('Products')} />
            <Button title="AI Recommendations" onPress={() => navigation.navigate('Chatbot')} />
            <Button title="Comparison" onPress={() => navigation.navigate('Comparison')} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 20 } });

