import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { ticketApi, TicketStatus, TicketSummary } from "../../src/api/ticket.api";
import { Card } from "../../src/components/Card";
import { colors, spacing, radius } from "../../src/theme/theme";

const POLL_INTERVAL_MS = 8000;

const STATUS_COLOR: Record<TicketStatus, string> = {
  OPEN: colors.warning,
  IN_PROGRESS: colors.info,
  RESOLVED: colors.success,
  CLOSED: colors.textSecondary,
};

const FILTERS: Array<{ label: string; value: TicketStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

export default function TicketsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", filter],
    queryFn: () => ticketApi.list(filter === "ALL" ? undefined : filter),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const tickets = data?.items ?? [];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, flexGrow: 1 }}
        renderItem={({ item }: { item: TicketSummary }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: "/tickets/[id]", params: { id: item.id } })}>
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={styles.rowBetween}>
                <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}22` }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{item.status.replace("_", " ")}</Text>
                </View>
              </View>
              <Text style={styles.meta}>{new Date(item.updatedAt).toLocaleString()}</Text>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No tickets in this filter.</Text>
          ) : (
            <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
          )
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/tickets/new")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { flexGrow: 0, paddingVertical: spacing.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  filterChipTextActive: { color: "#fff" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subject: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "700" },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
