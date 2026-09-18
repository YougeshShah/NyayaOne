import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SectionList, ActivityIndicator, Image, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../src/api/client";

interface ContentItem {
  id: string;
  term: string;
  title: string;
  fileType: "PDF" | "IMAGE" | "TEXT";
  fileUrl: string | null;
  textBody: string | null;
}

export default function CourseContentViewerScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [viewingText, setViewingText] = useState<ContentItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mobile-course-content", courseId],
    queryFn: async () => (await apiClient.get(`/course-content/course/${courseId}/student`)).data.data as ContentItem[],
  });

  const sections = (() => {
    const byTerm: Record<string, ContentItem[]> = {};
    (data ?? []).forEach((item) => {
      if (!byTerm[item.term]) byTerm[item.term] = [];
      byTerm[item.term].push(item);
    });
    return Object.entries(byTerm).map(([term, items]) => ({ title: term, data: items }));
  })();

  const openItem = (item: ContentItem) => {
    if (item.fileType === "TEXT") {
      setViewingText(item);
    } else if (item.fileUrl) {
      Linking.openURL(item.fileUrl);
    }
  };

  if (viewingText) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setViewingText(null)} style={styles.backRow}>
          <Ionicons name="arrow-back" size={18} color="#2563EB" />
          <Text style={styles.backText}>Back to content list</Text>
        </TouchableOpacity>
        <Text style={styles.textTitle}>{viewingText.title}</Text>
        <View style={styles.textBody}>
          <Text style={styles.textBodyContent}>{viewingText.textBody}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} color="#2563EB" />}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>No content available yet.</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemCard} onPress={() => openItem(item)}>
            <Ionicons
              name={item.fileType === "PDF" ? "document-text-outline" : item.fileType === "IMAGE" ? "image-outline" : "reader-outline"}
              size={20}
              color="#2563EB"
            />
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  list: { paddingBottom: 40 },
  sectionHeader: { fontSize: 13, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 30 },
  itemCard: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, marginBottom: 8 },
  itemTitle: { flex: 1, fontSize: 14, color: "#111827" },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText: { color: "#2563EB", fontWeight: "600" },
  textTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  textBody: { flex: 1 },
  textBodyContent: { fontSize: 14, color: "#374151", lineHeight: 22 },
});
