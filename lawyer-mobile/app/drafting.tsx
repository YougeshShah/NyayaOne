import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../src/api/client";
import { colors, spacing, radius } from "../src/theme/theme";

interface PrecedentItem {
  id: string;
  title: string;
  caseNumber: string | null;
  decisionDate: string | null;
}

interface PrecedentDetail extends PrecedentItem {
  fullContent: string;
}

export default function DraftingPanelScreen() {
  const [tab, setTab] = useState<"research" | "draft">("research");
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selected, setSelected] = useState<PrecedentDetail | null>(null);
  const [draftContent, setDraftContent] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["drafting-precedent-search", activeSearch],
    queryFn: async () => {
      const { data } = await apiClient.get("/precedents", { params: { search: activeSearch, limit: 15 } });
      return data.data as { items: PrecedentItem[] };
    },
    enabled: !!activeSearch,
  });

  const openPrecedent = async (id: string) => {
    const { data } = await apiClient.get(`/precedents/${id}`);
    setSelected(data.data);
  };

  const insertCitation = () => {
    if (!selected) return;
    const citation = `\n\n[${selected.title}${selected.caseNumber ? ` - ${selected.caseNumber}` : ""}${selected.decisionDate ? `, ${selected.decisionDate}` : ""}]\n`;
    setDraftContent((prev) => prev + citation);
    setTab("draft");
  };

  const shareDraft = () => {
    if (draftContent.trim()) Share.share({ message: draftContent });
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabButton, tab === "research" && styles.tabButtonActive]} onPress={() => setTab("research")}>
          <Ionicons name="search" size={16} color={tab === "research" ? "#fff" : colors.primary} />
          <Text style={[styles.tabButtonText, tab === "research" && styles.tabButtonTextActive]}>Research</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, tab === "draft" && styles.tabButtonActive]} onPress={() => setTab("draft")}>
          <Ionicons name="document-text" size={16} color={tab === "draft" ? "#fff" : colors.primary} />
          <Text style={[styles.tabButtonText, tab === "draft" && styles.tabButtonTextActive]}>Draft</Text>
        </TouchableOpacity>
      </View>

      {tab === "research" ? (
        <View style={styles.researchPane}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Search precedents..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => setActiveSearch(searchText)}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => setActiveSearch(searchText)}>
              <Ionicons name="search" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {isLoading && <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />}

          {selected ? (
            <ScrollView style={styles.detailScroll}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.backLink}>← Back to results</Text>
              </TouchableOpacity>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <TouchableOpacity style={styles.insertButton} onPress={insertCitation}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.insertButtonText}>Insert Citation into Draft</Text>
              </TouchableOpacity>
              <Text style={styles.detailContent}>{selected.fullContent}</Text>
            </ScrollView>
          ) : (
            <FlatList
              data={results?.items ?? []}
              keyExtractor={(i) => i.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultCard} onPress={() => openPrecedent(item.id)}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultMeta}>{[item.caseNumber, item.decisionDate].filter(Boolean).join(" · ")}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : (
        <View style={styles.draftPane}>
          <View style={styles.draftHeader}>
            <Text style={styles.draftHeaderText}>Your Draft</Text>
            <TouchableOpacity onPress={shareDraft}>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.draftInput}
            multiline
            value={draftContent}
            onChangeText={setDraftContent}
            placeholder="Start drafting your निवेदन, सम्झौता, or legal opinion here. Switch to Research to find and insert citations."
            textAlignVertical="top"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  tabButton: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 12 },
  tabButtonActive: { backgroundColor: colors.primary },
  tabButtonText: { fontSize: 14, fontWeight: "600", color: colors.primary },
  tabButtonTextActive: { color: "#fff" },
  researchPane: { flex: 1, padding: spacing.md },
  searchRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  input: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10 },
  searchButton: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  list: { paddingBottom: 20 },
  resultCard: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  resultTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  resultMeta: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  detailScroll: { flex: 1 },
  backLink: { color: colors.primary, marginBottom: spacing.sm },
  detailTitle: { fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  insertButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, marginBottom: spacing.md },
  insertButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  detailContent: { fontSize: 13, color: "#374151", lineHeight: 20 },
  draftPane: { flex: 1, padding: spacing.md },
  draftHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  draftHeaderText: { fontSize: 15, fontWeight: "700" },
  draftInput: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, padding: spacing.md, fontSize: 14 },
});
