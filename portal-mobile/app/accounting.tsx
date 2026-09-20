import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { accountingApi } from "../src/api/accounting.api";
import { colors, spacing, radius } from "../src/theme/theme";

function formatCurrency(n: number): string {
  return `रु ${n.toLocaleString()}`;
}

export default function AccountingScreen() {
  const [search, setSearch] = useState("");
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["accounting-summary"],
    queryFn: () => accountingApi.getSummary(),
  });
  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ["accounting-transactions", search],
    queryFn: () => accountingApi.listTransactions(search || undefined),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accounting</Text>
        <View style={{ width: 22 }} />
      </View>

      {loadingSummary ? (
        <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />
      ) : (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.totalCollected ?? 0)}</Text>
            <Text style={styles.summaryLabel}>Total Collected</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.thisMonthCollected ?? 0)}</Text>
            <Text style={styles.summaryLabel}>This Month</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#D97706" }]}>{summary?.pendingCount ?? 0}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Transactions</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by student or receipt no."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />

      {loadingTx ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
      ) : (
        <FlatList
          data={transactions ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.txCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.txName}>{item.studentName || "—"}</Text>
                {item.courseName && <Text style={styles.txMeta}>{item.courseName}</Text>}
                <Text style={styles.txMeta}>{new Date(item.createdAt).toLocaleDateString()} · {item.paymentMethod}</Text>
              </View>
              <Text style={styles.txAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: spacing.lg },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  summaryValue: { fontSize: 15, fontWeight: "800", color: colors.primary },
  summaryLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginBottom: 8 },
  searchInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, marginBottom: spacing.md, fontSize: 14 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: 30 },
  txCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  txName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  txMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "800", color: "#059669" },
});
