import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSendChatMessage } from "../hooks";
import { ChatMessage } from "../types";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your study assistant. Ask me anything." },
  ]);
  const sendMessage = useSendChatMessage();

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    sendMessage.mutate(
      { message: input, history: messages },
      {
        onSuccess: (reply) => setMessages((prev) => [...prev, { role: "assistant", content: reply }]),
        onError: () => setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]),
      }
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Study Assistant</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 12 }}>
              {messages.map((m, i) => (
                <View key={i} style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.botBubble]}>
                  <Text style={{ color: m.role === "user" ? "#fff" : "#111827" }}>{m.content}</Text>
                </View>
              ))}
              {sendMessage.isPending && <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 8 }} />}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput style={styles.input} placeholder="Ask a question..." value={input} onChangeText={setInput} onSubmitEditing={handleSend} />
              <TouchableOpacity onPress={handleSend} disabled={sendMessage.isPending}>
                <Ionicons name="send" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: "absolute", bottom: 90, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", elevation: 4, zIndex: 999 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { height: "70%", backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#2563EB", padding: 14 },
  headerText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  bubble: { maxWidth: "85%", borderRadius: 12, padding: 10, marginBottom: 8 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#2563EB" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#F1F5F9" },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  input: { flex: 1, backgroundColor: "#F3F4F6", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
});
