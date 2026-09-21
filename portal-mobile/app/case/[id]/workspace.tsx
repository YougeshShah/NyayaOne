import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../src/api/client";
import { colors, spacing, radius } from "../../../src/theme/theme";

const STATUS_COLORS: Record<string, string> = { PENDING: "#9CA3AF", IN_PROGRESS: "#3B82F6", DONE: "#10B981" };

export default function CaseWorkspaceScreen() {
  const { id: caseId } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"tasks" | "notes" | "deadlines">("tasks");

  const { data: tasks } = useQuery({
    queryKey: ["mobile-case-tasks", caseId],
    queryFn: async () => (await apiClient.get(`/case-tasks/case/${caseId}`)).data.data,
    enabled: tab === "tasks",
  });
  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/case-tasks/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mobile-case-tasks", caseId] }),
  });

  const [newNote, setNewNote] = useState("");
  const { data: notes } = useQuery({
    queryKey: ["mobile-case-notes", caseId],
    queryFn: async () => (await apiClient.get(`/case-notes/case/${caseId}`)).data.data,
    enabled: tab === "notes",
  });
  const createNote = useMutation({
    mutationFn: () => apiClient.post(`/case-notes/case/${caseId}`, { content: newNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-case-notes", caseId] });
      setNewNote("");
    },
  });
  const deleteNote = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/case-notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mobile-case-notes", caseId] }),
  });

  const { data: deadlines } = useQuery({
    queryKey: ["mobile-case-deadlines", caseId],
    queryFn: async () => (await apiClient.get(`/case-deadlines/case/${caseId}`)).data.data,
    enabled: tab === "deadlines",
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {(["tasks", "notes", "deadlines"] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tabButton, tab === t && styles.tabButtonActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabButtonText, tab === t && styles.tabButtonTextActive]}>
              {t === "tasks" ? "Tasks" : t === "notes" ? "Notes" : "Deadlines"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "tasks" && (
        <FlatList
          data={tasks ?? []}
          keyExtractor={(t: any) => t.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.assignee.fullName}{item.dueDate ? ` · Due ${new Date(item.dueDate).toLocaleDateString()}` : ""}
              </Text>
              <View style={styles.statusRow}>
                {["PENDING", "IN_PROGRESS", "DONE"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusChip, { borderColor: STATUS_COLORS[s] }, item.status === s && { backgroundColor: STATUS_COLORS[s] }]}
                    onPress={() => updateTaskStatus.mutate({ id: item.id, status: s })}
                  >
                    <Text style={[styles.statusChipText, item.status === s && { color: "#fff" }]}>{s.replace("_", " ")}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
      )}

      {tab === "notes" && (
        <View style={styles.notesContainer}>
          <View style={styles.noteInputRow}>
            <TextInput style={styles.noteInput} placeholder="Add an internal note..." value={newNote} onChangeText={setNewNote} multiline />
            <TouchableOpacity style={styles.addButton} onPress={() => createNote.mutate()} disabled={!newNote.trim()}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={notes ?? []}
            keyExtractor={(n: any) => n.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.noteContent}>{item.content}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.cardMeta}>{item.author.fullName} · {new Date(item.createdAt).toLocaleDateString()}</Text>
                  <TouchableOpacity onPress={() => deleteNote.mutate(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {tab === "deadlines" && (
        <FlatList
          data={deadlines ?? []}
          keyExtractor={(d: any) => d.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No deadlines set.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                Due {new Date(item.dueAt).toLocaleString()} · Reminder {item.sent ? "sent" : "pending"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabButtonActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabButtonText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  tabButtonTextActive: { color: colors.primary },
  list: { padding: spacing.md, paddingBottom: 40 },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 30 },
  card: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  cardMeta: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  statusRow: { flexDirection: "row", gap: 6, marginTop: spacing.sm },
  statusChip: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  statusChipText: { fontSize: 10, fontWeight: "600", color: "#374151" },
  notesContainer: { flex: 1, padding: spacing.md },
  noteInputRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  noteInput: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, padding: spacing.sm, minHeight: 50 },
  addButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  noteContent: { fontSize: 13, color: "#374151" },
  noteFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
});
