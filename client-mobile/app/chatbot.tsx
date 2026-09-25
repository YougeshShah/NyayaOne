import { useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../src/api/client";

interface Message {
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
}

export default function ChatbotScreen() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList>(null);

  const ask = useMutation({
    mutationFn: async (q: string) => {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const { data } = await apiClient.post("/chatbot/message", { message: q, history });
      return data.data as { reply: string };
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: msg, isError: true }]);
    },
  });

  const handleAsk = () => {
    if (!question.trim() || ask.isPending) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    ask.mutate(question);
    setQuestion("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Ask general questions about your case status or how to use the app. For specific legal advice about your case, please contact your lawyer directly.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.role === "user" && styles.messageRowUser]}>
            <Ionicons name={item.role === "assistant" ? "chatbubble-ellipses" : "person-circle-outline"} size={20} color={item.role === "assistant" ? "#1565C0" : "#6B7280"} />
            <View style={styles.messageContent}>
              <Text style={[styles.messageText, item.isError && styles.errorText]}>{item.text}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          ask.isPending ? (
            <View style={styles.messageRow}>
              <ActivityIndicator size="small" color="#1565C0" />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          ) : null
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={handleAsk}
          editable={!ask.isPending}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleAsk} disabled={!question.trim() || ask.isPending}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  list: { padding: 16, flexGrow: 1 },
  emptyText: { color: "#6B7280", textAlign: "center", marginTop: 40, paddingHorizontal: 20 },
  messageRow: { flexDirection: "row", gap: 8, marginBottom: 16, alignItems: "flex-start" },
  messageRowUser: {},
  messageContent: { flex: 1 },
  messageText: { fontSize: 14, color: "#111827", lineHeight: 20 },
  errorText: { color: "#DC2626" },
  thinkingText: { color: "#6B7280", fontSize: 13 },
  inputRow: { flexDirection: "row", gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 100 },
  sendButton: { backgroundColor: "#1565C0", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
