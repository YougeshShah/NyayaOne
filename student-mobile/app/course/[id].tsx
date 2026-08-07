import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSubjects, useMySubscriptions } from "../../src/hooks";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: subjects, isLoading } = useSubjects(id);
  const { data: subscriptions } = useMySubscriptions();

  const isSubscribed = (subscriptions ?? []).some((s) => s.courseId === id && (s.status === "ACTIVE" || s.status === "TRIAL"));

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {!isSubscribed && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🔓 Browsing free demo content. Subscribe on the website for full access.</Text>
        </View>
      )}
      <FlatList
        data={subjects ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Practice by Subject</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.subjectCard} onPress={() => router.push(`/practice/${id}?subjectId=${item.id}`)}>
            <Text style={styles.subjectName}>{item.name}</Text>
            <Text style={styles.subjectCta}>Practice →</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: "#6B7280" }}>No subjects added yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { backgroundColor: "#FFFBEB", padding: 12, borderBottomWidth: 1, borderBottomColor: "#FDE68A" },
  bannerText: { fontSize: 12, color: "#92400E" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  subjectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  subjectName: { fontSize: 15, fontWeight: "600" },
  subjectCta: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
});
