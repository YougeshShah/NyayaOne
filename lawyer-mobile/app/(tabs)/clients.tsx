import { View, Text, StyleSheet, FlatList, TextInput } from "react-native";
import { useState } from "react";
import { useClients } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { colors, spacing } from "../../src/theme/theme";

export default function ClientsScreen() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useClients(search || undefined);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search clients..."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.sm }}>
            <Text style={styles.name}>{item.fullName}</Text>
            {item.phone && <Text style={styles.detail}>📞 {item.phone}</Text>}
            {item.address && <Text style={styles.detail}>📍 {item.address}</Text>}
            <Text style={styles.caseCount}>{item._count?.cases ?? 0} case(s)</Text>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No clients found.</Text> : <Text style={styles.emptyText}>Loading...</Text>
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
  name: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  detail: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  caseCount: { fontSize: 12, color: colors.primary, marginTop: 6, fontWeight: "600" },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
});
