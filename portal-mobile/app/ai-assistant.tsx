import { useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../src/api/client";
import { colors, spacing, radius } from "../src/theme/theme";

interface Source {
  id: string;
  title: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  isError?: boolean;
}

export default function AiAssistantScreen() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList>(null);

  const ask = useMutation({
    mutationFn: async (q: string) => {
      const { data } = await apiClient.post("/ai-assistant/ask", { question: q });
      return data.data as { answer: string; sources: Source[] };
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, sources: data.sources }]);
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
            Ask something like "Property dispute cases मा K decision हुन्छ?" — answers are grounded in our नजिर
            database with exact citations.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.role === "user" && styles.messageRowUser]}>
            <Ionicons name={item.role === "assistant" ? "sparkles" : "person-circle-outline"} size={20} color={item.role === "assistant" ? colors.primary : "#6B7280"} />
            <View style={styles.messageContent}>
              <Text style={[styles.messageText, item.isError && styles.errorText]}>{item.text}</Text>
              {item.sources && item.sources.length > 0 && (
                <View style={styles.sourcesRow}>
                  {item.sources.map((s: Source) => (
                    <View key={s.id} style={styles.sourceChip}>
                      <Text style={styles.sourceChipText} numberOfLines={1}>{s.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
        ListFooterComponent={
          ask.isPending ? (
            <View style={styles.messageRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          ) : null
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask a legal question..."
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
  list: { padding: spacing.md, flexGrow: 1 },
  emptyText: { color: "#6B7280", textAlign: "center", marginTop: 40, paddingHorizontal: spacing.lg },
  messageRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, alignItems: "flex-start" },
  messageRowUser: {},
  messageContent: { flex: 1 },
  messageText: { fontSize: 14, color: "#111827", lineHeight: 20 },
  errorText: { color: "#DC2626" },
  thinkingText: { color: "#6B7280", fontSize: 13 },
  sourcesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: spacing.xs },
  sourceChip: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 200 },
  sourceChipText: { fontSize: 11, color: "#374151" },
  inputRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: "#E5E7EB", alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100 },
  sendButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
