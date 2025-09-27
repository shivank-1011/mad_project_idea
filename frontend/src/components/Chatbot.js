import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import { getAIRecommendation } from '../api/aiApi';

export default function Chatbot() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSend = async () => {
        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        const response = await getAIRecommendation({ query: input });
        setMessages([...messages, userMessage, { role: 'bot', content: response }]);
        setInput('');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.chat}>
                {messages.map((m, i) => (
                    <Text key={i} style={m.role === 'user' ? styles.user : styles.bot}>{m.content}</Text>
                ))}
            </ScrollView>
            <TextInput value={input} onChangeText={setInput} style={styles.input} placeholder="Ask about smartphones..." />
            <Button title="Send" onPress={handleSend} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    chat: { flex: 1, marginBottom: 10 },
    user: { textAlign: 'right', marginVertical: 5, color: 'blue' },
    bot: { textAlign: 'left', marginVertical: 5, color: 'green' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
});

