import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClients } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { colors, spacing } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";

export default function ClientsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useClients(search || undefined);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t("searchClients")}
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
          !isLoading ? <Text style={styles.emptyText}>{t("noClientsFound")}</Text> : <Text style={styles.emptyText}>{t("loading")}</Text>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/client/create")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
