import { useQuery } from "@tanstack/react-query";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { progressApi } from "../src/api";

function scoreColor(percent: number): string {
  if (percent >= 75) return "#059669";
  if (percent >= 50) return "#D97706";
  return "#DC2626";
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "1A" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["study-analytics"],
    queryFn: () => progressApi.getAnalytics(),
  });
  const { data: attempts, isLoading: loadingAttempts } = useQuery({
    queryKey: ["my-test-attempts"],
    queryFn: () => progressApi.myAttempts(),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>My Progress</Text>

      {loadingAnalytics ? (
        <ActivityIndicator color="#2563EB" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard icon="document-text-outline" label="Tests Taken" value={analytics?.testsTaken ?? 0} color="#2563EB" />
          <StatCard icon="trending-up-outline" label="Avg Score" value={`${analytics?.averageScorePercent ?? 0}%`} color="#059669" />
          <StatCard icon="help-circle-outline" label="Practice Qs" value={analytics?.practiceQuestionsAnswered ?? 0} color="#D97706" />
          <StatCard icon="checkmark-circle-outline" label="Accuracy" value={`${analytics?.practiceAccuracyPercent ?? 0}%`} color="#7C3AED" />
        </View>
      )}

      <Text style={styles.sectionTitle}>Test History</Text>

      {loadingAttempts ? (
        <ActivityIndicator color="#2563EB" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={attempts ?? []}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="document-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No mock tests taken yet — go practice one!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const percent = item.submittedAt && item.totalQuestions && item.score != null ? Math.round((item.score / item.totalQuestions) * 100) : null;
            return (
              <View style={styles.attemptRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.attemptTitle}>{item.mockTest.title}</Text>
                  <Text style={styles.attemptDate}>{new Date(item.startedAt).toLocaleDateString()}</Text>
                </View>
                {item.submittedAt ? (
                  <View style={styles.attemptScoreCol}>
                    <Text style={[styles.attemptScore, { color: percent !== null ? scoreColor(percent) : "#111827" }]}>
                      {item.score}/{item.totalQuestions}
                    </Text>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.inProgressBadge}>
                    <Text style={styles.inProgressBadgeText}>In Progress</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  title: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statCard: { width: "47%", backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 },
  emptyBox: { alignItems: "center", padding: 30, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  emptyText: { fontSize: 13, color: "#6B7280", marginTop: 8, textAlign: "center" },
  attemptRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#F1F5F9", padding: 14, marginBottom: 10 },
  attemptTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  attemptDate: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  attemptScoreCol: { alignItems: "flex-end" },
  attemptScore: { fontSize: 15, fontWeight: "800" },
  completedBadge: { backgroundColor: "#D1FAE5", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  completedBadgeText: { fontSize: 10, fontWeight: "700", color: "#059669" },
  inProgressBadge: { backgroundColor: "#F3F4F6", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  inProgressBadgeText: { fontSize: 10, fontWeight: "700", color: "#6B7280" },
});
