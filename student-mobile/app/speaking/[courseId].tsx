import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { speakingApi } from "../../src/api";

export default function SpeakingPromptsScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const [part, setPart] = useState(1);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["speaking-prompts-student", courseId, part],
    queryFn: () => speakingApi.listPrompts(courseId as string, part),
    enabled: !!courseId,
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {[1, 2, 3].map((p) => (
          <TouchableOpacity key={p} onPress={() => setPart(p)} style={[styles.tab, part === p && styles.tabActive]}>
            <Text style={[styles.tabText, part === p && styles.tabTextActive]}>Part {p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}

      <FlatList
        data={prompts ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>No questions available for this part yet.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardPrompt}>{item.promptText}</Text>
            <Text style={styles.cardMeta}>
              {item.prepTimeSeconds ? `${item.prepTimeSeconds}s prep + ` : ""}
              {item.speakTimeSeconds}s to speak
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push({ pathname: "/speaking-test", params: { prompt: JSON.stringify(item) } })}
            >
              <Ionicons name="mic" size={16} color="#fff" />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabRow: { flexDirection: "row", padding: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center" },
  tabActive: { backgroundColor: "#2563EB" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  tabTextActive: { color: "#fff" },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  cardPrompt: { fontSize: 13, color: "#374151", marginBottom: 8 },
  cardMeta: { fontSize: 11, color: "#6B7280", marginBottom: 12 },
  startButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  startButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
