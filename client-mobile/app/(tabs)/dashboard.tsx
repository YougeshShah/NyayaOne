import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useMyCases, useMyHearings } from "../../src/hooks/useDomainData";
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

  const { data: cases } = useMyCases();
  const { data: upcomingHearings } = useMyHearings(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const openCases = cases?.filter((c) => c.status === "OPEN" || c.status === "ONGOING").length ?? 0;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.greeting}>Welcome,</Text>
      <Text style={styles.name}>{user?.fullName}</Text>
      {user?.tenantName && (
        <View style={styles.firmBadge}>
          <Text style={styles.firmBadgeText}>{user.tenantName}</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{cases?.length ?? "—"}</Text>
          <Text style={styles.statLabel}>My Cases</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{openCases}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingHearings?.length ?? "—"}</Text>
          <Text style={styles.statLabel}>Upcoming Hearings</Text>
        </Card>
      </View>

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

      <Text style={styles.sectionTitle}>My Cases</Text>
      {(!cases || cases.length === 0) && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.emptyText}>No cases yet.</Text>
        </Card>
      )}
      {cases?.slice(0, 4).map((c) => (
        <TouchableOpacity key={c.id} onPress={() => router.push(`/case/${c.id}`)}>
          <Card style={{ marginBottom: spacing.sm }}>
            <View style={styles.hearingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hearingTitle}>{c.caseTitle}</Text>
                <Text style={styles.hearingSub}>{c.caseNumber}</Text>
              </View>
              <StatusBadge status={c.status} />
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
  name: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
  firmBadge: { alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  firmBadgeText: { fontSize: 12, fontWeight: "600", color: colors.primary },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: "center", paddingVertical: spacing.md },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: spacing.sm, marginTop: spacing.sm },
  hearingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hearingTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  hearingSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 13, color: colors.textSecondary },
});
