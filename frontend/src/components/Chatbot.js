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
import Markdown from "react-native-markdown-display";
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

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        'Hi! I\'m your AI assistant. Ask me anything about smartphones, and I\'ll help you find the perfect device for your needs!\n\n💡 Try asking:\n• "Best phone under 30000"\n• "Gaming phone with good battery"\n• "Samsung phone for photography"\n• "iPhone with best camera"\n• "Budget phone under 20k"',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const send = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");

    try {
      // Prepare conversation history (exclude welcome message, include last 10 messages)
      const conversationHistory = newMessages
        .slice(1) // Skip welcome message
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.content,
        }));

      const reply = await getAIRecommendation({
        query: currentInput,
        conversationHistory: conversationHistory,
      });

      setMessages([...newMessages, { role: "bot", content: reply }]);
    } catch (error) {
      console.error("AI Error:", error);
      let errorMessage =
        "Sorry, I'm having trouble right now. Please try again later.";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage =
            "AI service is not available. Please check if the backend server is running.";
        } else if (error.response.status === 500) {
          errorMessage =
            "Sorry, I encountered an error processing your request. Please try a different query.";
        }
      } else if (error.request) {
        // No response received
        errorMessage =
          "Cannot connect to the server. Please make sure the backend is running on port 3001.";
      }

      setMessages([
        ...newMessages,
        {
          role: "bot",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const showMessage = (msg, index) => {
    const isUser = msg.role === "user";
    return (
      <View
        key={index}
        style={[
          styles.message,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          {isUser ? (
            <Text style={[styles.text, styles.userText]}>{msg.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{msg.content}</Markdown>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Assistant</Text>
        <Text style={styles.subtitle}>
          Get personalized phone recommendations
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(showMessage)}
        {loading && (
          <View style={[styles.message, styles.botMessage]}>
            <View
              style={[styles.bubble, styles.botBubble, styles.loadingBubble]}
            >
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputBox}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.field}
          placeholder="Ask about smartphones..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <CustomButton
          title="Send"
          onPress={send}
          disabled={!input.trim() || loading}
          loading={loading}
          style={styles.send}
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
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chat: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  message: {
    marginVertical: spacing.xs,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  botMessage: {
    alignItems: "flex-start",
  },
  bubble: {
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
  text: {
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
  inputBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    ...shadows.lg,
  },
  field: {
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
  send: {
    paddingHorizontal: spacing.lg,
    minWidth: 80,
  },
});

const markdownStyles = {
  body: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  heading1: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  heading2: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  strong: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  em: {
    fontStyle: "italic",
  },
  bullet_list: {
    marginVertical: spacing.xs,
  },
  ordered_list: {
    marginVertical: spacing.xs,
  },
  list_item: {
    flexDirection: "row",
    marginVertical: spacing.xxs,
  },
  bullet_list_icon: {
    marginRight: spacing.xs,
    fontSize: typography.fontSize.md,
  },
  code_inline: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    fontFamily: "monospace",
    fontSize: typography.fontSize.sm,
  },
  fence: {
    backgroundColor: colors.border,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
  },
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.sm,
  },
  paragraph: {
    marginVertical: spacing.xs,
  },
  link: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
};
