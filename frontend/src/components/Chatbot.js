import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAIRecommendation } from "../api/aiApi";
import { CustomButton } from "./CustomButton";
import { commonStyles } from "../styles/commonStyles";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/theme";

export default function Chatbot() {
  const [text, setText] = useState("");
  const [chat, setChat] = useState([
    {
      role: "bot",
      content:
        "Hi! I'm your AI assistant. Ask me anything about smartphones, and I'll help you find the perfect device for your needs!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  const send = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    const userMsg = { role: "user", content: text };
    const newChat = [...chat, userMsg];
    setChat(newChat);
    setText("");

    try {
      const reply = await getAIRecommendation({ query: text });
      setChat([...newChat, { role: "bot", content: reply }]);
    } catch (error) {
      setChat([
        ...newChat,
        {
          role: "bot",
          content:
            "Sorry, I'm having trouble right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chat]);

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.botText,
            ]}
          >
            {msg.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSubtitle}>
          Get personalized phone recommendations
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {chat.map(renderMessage)}
        {isLoading && (
          <View style={[styles.messageContainer, styles.botMessageContainer]}>
            <View
              style={[
                styles.messageBubble,
                styles.botBubble,
                styles.loadingBubble,
              ]}
            >
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Ask about smartphones..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <CustomButton
          title="Send"
          onPress={send}
          disabled={!text.trim() || isLoading}
          loading={isLoading}
          style={styles.sendButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    marginVertical: spacing.xs,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingBubble: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  userText: {
    color: colors.surface,
  },
  botText: {
    color: colors.text,
  },
  loadingText: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  inputContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    ...shadows.lg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: spacing.lg,
    minWidth: 80,
  },
});
