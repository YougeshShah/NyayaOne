import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useCases, useTodayHearings, useUpcomingHearings } from "../../src/hooks/useDomainData";
import { useAuthStore } from "../../src/store/authStore";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/theme/theme";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: allCases } = useCases();
  const { data: openCases } = useCases({ status: "OPEN" });
  const { data: todayHearings } = useTodayHearings();
  const { data: upcomingHearings } = useUpcomingHearings();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.greeting}>Welcome back,</Text>
      <Text style={styles.name}>{user?.fullName}</Text>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{allCases?.pagination.total ?? "—"}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{openCases?.pagination.total ?? "—"}</Text>
          <Text style={styles.statLabel}>Open Cases</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{todayHearings?.length ?? "—"}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Today's Hearings</Text>
      {(!todayHearings || todayHearings.length === 0) && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.emptyText}>No hearings scheduled today.</Text>
        </Card>
      )}
      {todayHearings?.map((h) => (
        <TouchableOpacity key={h.id} onPress={() => router.push(`/case/${h.case.id}`)}>
          <Card style={{ marginBottom: spacing.sm }}>
            <View style={styles.hearingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hearingTitle}>{h.case.caseTitle}</Text>
                <Text style={styles.hearingSub}>
                  {h.case.caseNumber} — {new Date(h.hearingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
              <StatusBadge status={h.status} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Upcoming Hearings</Text>
      {(!upcomingHearings || upcomingHearings.length === 0) && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.emptyText}>No upcoming hearings.</Text>
        </Card>
      )}
      {upcomingHearings?.slice(0, 5).map((h) => (
        <TouchableOpacity key={h.id} onPress={() => router.push(`/case/${h.case.id}`)}>
          <Card style={{ marginBottom: spacing.sm }}>
            <View style={styles.hearingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hearingTitle}>{h.case.caseTitle}</Text>
                <Text style={styles.hearingSub}>
                  {h.case.caseNumber} — {new Date(h.hearingDate).toLocaleDateString()}
                </Text>
              </View>
              <StatusBadge status={h.status} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  greeting: { fontSize: 14, color: colors.textSecondary },
  name: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.md },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: "center", paddingVertical: spacing.md },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: spacing.sm, marginTop: spacing.sm },
  hearingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hearingTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  hearingSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 13, color: colors.textSecondary },
});
