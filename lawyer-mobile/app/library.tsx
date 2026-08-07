import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLibraryResources, useDownloadLibraryResource } from "../src/hooks/useLibrary";
import { Card } from "../src/components/Card";
import { colors, spacing, radius } from "../src/theme/theme";
import { useTranslation } from "../src/i18n/LanguageContext";
import { getGroupedTypeOptions, getLibraryTypeLabel } from "../src/i18n/libraryTaxonomy";
import { LibraryResourceType } from "../src/api/library.api";

export default function LibraryScreen() {
  const { t, language } = useTranslation();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<LibraryResourceType | "ALL">("ALL");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading } = useLibraryResources({
    search: search || undefined,
    type: type === "ALL" ? undefined : type,
  });
  const downloadResource = useDownloadLibraryResource();
  const groupedTypes = getGroupedTypeOptions(language);

  const handleDownload = async (id: string, title: string) => {
    setDownloadingId(id);
    try {
      await downloadResource.mutateAsync({ id, title });
    } catch {
      Alert.alert(t("error"), t("couldNotDownload"));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t("searchLibraryPlaceholder")}
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        data={[{ type: "ALL" as const, label: t("allTypes") }, ...groupedTypes.map((g) => ({ type: g.type, label: g.label }))]}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, type === item.type && styles.chipActive]}
            onPress={() => setType(item.type as any)}
          >
            <Text style={[styles.chipText, type === item.type && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ListEmptyComponent={<Text style={styles.emptyText}>{t("noResourcesFound")}</Text>}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.typeLabel}>{getLibraryTypeLabel(item.type, language)}</Text>
                    {item.isRepealed && (
                      <View style={styles.repealedBadge}>
                        <Text style={styles.repealedText}>{t("repealed")}</Text>
                      </View>
                    )}
                  </View>
                  {item.category && <Text style={styles.category}>{item.category}</Text>}
                </View>
                {item.fileUrl && item.isDownloadable && (
                  <TouchableOpacity onPress={() => handleDownload(item.id, item.title)} style={styles.downloadBtn} disabled={downloadingId === item.id}>
                    {downloadingId === item.id ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons name="download-outline" size={22} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchInput: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: { paddingHorizontal: spacing.md, marginBottom: spacing.sm, flexGrow: 0 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: "#fff" },
  row: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  typeLabel: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  category: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  repealedBadge: { backgroundColor: "#FEE2E2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  repealedText: { fontSize: 10, color: "#DC2626", fontWeight: "700" },
  downloadBtn: { padding: spacing.sm },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
});
