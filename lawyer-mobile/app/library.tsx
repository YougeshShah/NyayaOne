import { useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLibraryResources, useDownloadLibraryResource } from "../src/hooks/useLibrary";
import { Card } from "../src/components/Card";
import { colors, spacing, radius } from "../src/theme/theme";
import { useTranslation } from "../src/i18n/LanguageContext";
import { getGroupedTypeOptions, getLibraryTypeLabel } from "../src/i18n/libraryTaxonomy";
import { LibraryResourceType, LibraryResource } from "../src/api/library.api";

function HighlightedText({ text, term, activeInThisParagraph }: { text: string; term: string; activeInThisParagraph: number | null }) {
  if (!term.trim()) return <Text>{text}</Text>;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  let localMatchIndex = -1;
  return (
    <Text>
      {parts.map((part, i) => {
        if (part.toLowerCase() !== term.toLowerCase()) return part;
        localMatchIndex++;
        const isActive = localMatchIndex === activeInThisParagraph;
        return (
          <Text key={i} style={{ backgroundColor: isActive ? "#FB923C" : "#FEF08A" }}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

function DocumentSearchViewer({ text, term }: { text: string; term: string }) {
  const scrollRef = useRef<ScrollView>(null);
  const paragraphYPositions = useRef<Record<number, number>>({});
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const paragraphs = useMemo(() => text.split(/\n+/), [text]);

  const matchCountsByParagraph = useMemo(() => {
    if (!term.trim()) return [];
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "gi");
    return paragraphs.map((p) => (p.match(re) ?? []).length);
  }, [paragraphs, term]);

  const totalMatches = matchCountsByParagraph.reduce((a, b) => a + b, 0);

  function locateMatch(globalIndex: number): { paragraphIndex: number; localIndex: number } {
    let remaining = globalIndex;
    for (let p = 0; p < matchCountsByParagraph.length; p++) {
      if (remaining < matchCountsByParagraph[p]) return { paragraphIndex: p, localIndex: remaining };
      remaining -= matchCountsByParagraph[p];
    }
    return { paragraphIndex: 0, localIndex: 0 };
  }

  const scrollToMatch = (globalIndex: number) => {
    const { paragraphIndex } = locateMatch(globalIndex);
    const y = paragraphYPositions.current[paragraphIndex];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 40), animated: true });
  };

  const goToMatch = (index: number) => {
    if (totalMatches === 0) return;
    const wrapped = (index + totalMatches) % totalMatches;
    setActiveMatchIndex(wrapped);
    scrollToMatch(wrapped);
  };

  const { paragraphIndex: activeParagraph, localIndex: activeLocalIndex } = locateMatch(activeMatchIndex);

  return (
    <View style={{ flex: 1 }}>
      {term.trim() && (
        <View style={docSearchStyles.matchBar}>
          <Text style={docSearchStyles.matchCount}>{totalMatches > 0 ? `${activeMatchIndex + 1} / ${totalMatches}` : "0 / 0"}</Text>
          <TouchableOpacity onPress={() => goToMatch(activeMatchIndex - 1)} disabled={totalMatches === 0}>
            <Ionicons name="chevron-up" size={20} color={totalMatches === 0 ? "#D1D5DB" : colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goToMatch(activeMatchIndex + 1)} disabled={totalMatches === 0}>
            <Ionicons name="chevron-down" size={20} color={totalMatches === 0 ? "#D1D5DB" : colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.md }}>
        {paragraphs.map((p, i) => (
          <View key={i} onLayout={(e) => (paragraphYPositions.current[i] = e.nativeEvent.layout.y)} style={{ marginBottom: 12 }}>
            <HighlightedText text={p} term={term} activeInThisParagraph={i === activeParagraph ? activeLocalIndex : null} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const docSearchStyles = StyleSheet.create({
  matchBar: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: "#F9FAFB", borderBottomWidth: 1, borderBottomColor: colors.border },
  matchCount: { fontSize: 13, color: colors.textSecondary, marginRight: "auto" },
});

export default function LibraryScreen() {
  const { t, language } = useTranslation();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<LibraryResourceType | "ALL">("ALL");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<LibraryResource | null>(null);
  const [viewerSearch, setViewerSearch] = useState("");

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
                {item.content && (
                  <TouchableOpacity onPress={() => { setViewingItem(item); setViewerSearch(""); }} style={styles.downloadBtn}>
                    <Ionicons name="eye-outline" size={22} color={colors.primary} />
                  </TouchableOpacity>
                )}
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

      <Modal visible={!!viewingItem} animationType="slide" onRequestClose={() => setViewingItem(null)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {viewingItem?.title}
            </Text>
            <TouchableOpacity onPress={() => setViewingItem(null)}>
              <Ionicons name="close" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Find a word or phrase in this document..."
            value={viewerSearch}
            onChangeText={setViewerSearch}
          />
          <DocumentSearchViewer text={viewingItem?.content ?? ""} term={viewerSearch} />
        </View>
      </Modal>
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
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: "700", flex: 1, marginRight: spacing.sm, color: colors.textPrimary },
  modalContent: { fontSize: 14, lineHeight: 22, color: colors.textPrimary },
});
