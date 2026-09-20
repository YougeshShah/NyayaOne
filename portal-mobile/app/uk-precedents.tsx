import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../src/api/client";
import { colors, spacing, radius } from "../src/theme/theme";

interface UkPrecedentItem {
  title: string;
  publishedDate: string;
  court: string;
  url: string;
  citation: string;
}

export default function UkPrecedentsScreen() {
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["uk-precedents-mobile", activeSearch, page],
    queryFn: async () => {
      const { data } = await apiClient.get("/uk-precedents/search", { params: { query: activeSearch, page } });
      return data.data as { items: UkPrecedentItem[]; page: number; source: string };
    },
    enabled: !!activeSearch,
  });

  const runSearch = () => {
    setPage(1);
    setActiveSearch(searchText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Live search of UK court judgments, sourced directly from the National Archives' Find Case Law service.
      </Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search UK judgments..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={runSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={runSearch}>
          <Ionicons name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />}

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading && activeSearch ? <Text style={styles.emptyText}>No results found.</Text> : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultCard} onPress={() => Linking.openURL(item.url)}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            <View style={styles.metaRow}>
              {item.citation ? <Text style={styles.metaChip}>{item.citation}</Text> : null}
              <Text style={styles.metaChip}>{item.court}</Text>
              <Text style={styles.metaChip}>{new Date(item.publishedDate).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          data && data.items.length > 0 ? (
            <View style={styles.pageRow}>
              <TouchableOpacity onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageButton}>
                <Ionicons name="chevron-back" size={18} color={page === 1 ? "#D1D5DB" : colors.primary} />
              </TouchableOpacity>
              <Text style={styles.pageText}>Page {page}</Text>
              <TouchableOpacity onPress={() => setPage((p) => p + 1)} style={styles.pageButton}>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: spacing.md },
  subtitle: { fontSize: 13, color: "#6B7280", marginBottom: spacing.md },
  searchRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  input: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10 },
  searchButton: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  list: { paddingBottom: 40 },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 20 },
  resultCard: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  resultTitle: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 6 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: { fontSize: 11, color: "#6B7280", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  pageRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.md, marginTop: spacing.md },
  pageButton: { padding: 8 },
  pageText: { fontSize: 13, color: "#6B7280" },
});
