import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useCases } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, spacing, priorityColor } from "../../src/theme/theme";
import { CaseListItem } from "../../src/types";

export default function CasesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useCases({ search: search || undefined });

  const renderItem = ({ item }: { item: CaseListItem }) => (
    <TouchableOpacity onPress={() => router.push(`/case/${item.id}`)}>
      <Card style={{ marginBottom: spacing.sm }}>
        <View style={styles.topRow}>
          <Text style={styles.caseNumber}>{item.caseNumber}</Text>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor[item.priority] }]} />
        </View>
        <Text style={styles.caseTitle}>{item.caseTitle}</Text>
        <Text style={styles.courtName}>{item.court.name}</Text>
        <View style={styles.bottomRow}>
          <StatusBadge status={item.status} />
          <Text style={styles.hearingCount}>{item._count.hearings} hearing(s)</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search case number or title..."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No cases found.</Text>
          ) : (
            <Text style={styles.emptyText}>Loading...</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  caseNumber: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  caseTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginTop: 4 },
  courtName: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hearingCount: { fontSize: 12, color: colors.textSecondary },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
});
