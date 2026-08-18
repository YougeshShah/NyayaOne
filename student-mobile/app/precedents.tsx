import { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrecedentSearch, usePrecedentDetail, usePrecedentCategories } from "../src/hooks";

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

// Same paragraph-level scroll-to-match approach used elsewhere in this app
// (Legal Library viewer) -- React Native has no scrollIntoView, so this
// tracks each paragraph's Y position and scrolls to whichever one holds
// the currently "active" match.
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
        <View style={styles.matchBar}>
          <Text style={styles.matchCount}>{totalMatches > 0 ? `${activeMatchIndex + 1} / ${totalMatches}` : "0 / 0"}</Text>
          <TouchableOpacity onPress={() => goToMatch(activeMatchIndex - 1)} disabled={totalMatches === 0}>
            <Ionicons name="chevron-up" size={20} color={totalMatches === 0 ? "#D1D5DB" : "#111827"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goToMatch(activeMatchIndex + 1)} disabled={totalMatches === 0}>
            <Ionicons name="chevron-down" size={20} color={totalMatches === 0 ? "#D1D5DB" : "#111827"} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16 }}>
        {paragraphs.map((p, i) => (
          <View key={i} onLayout={(e) => (paragraphYPositions.current[i] = e.nativeEvent.layout.y)} style={{ marginBottom: 10 }}>
            <HighlightedText text={p} term={term} activeInThisParagraph={i === activeParagraph ? activeLocalIndex : null} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const CATEGORY_LABELS_NE: Record<string, string> = {
  "Criminal": "फौजदारी",
  "Family / Property": "पारिवारिक / सम्पत्ति",
  "Constitutional / Writ": "संवैधानिक / रिट",
  "Civil / Contract": "देवानी / करार",
  "Land / Tenancy": "जग्गा / मोहीयानी",
  "Tax": "कर",
  "Labor": "श्रम",
  "Court Procedure": "अदालती कार्यविधि",
};

export default function PrecedentsScreen() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [inDocSearch, setInDocSearch] = useState("");

  const { data: categories } = usePrecedentCategories();
  const { data: results, isLoading } = usePrecedentSearch({ search: search || undefined, category: category || undefined, page, limit: 20 });
  const { data: detail, isLoading: loadingDetail } = usePrecedentDetail(viewingId ?? undefined);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="कुनैपनि शब्द, पक्षको नाम खोज्नुहोस्..."
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={() => {
            setSearch(searchInput);
            setPage(1);
          }}
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity onPress={() => setCategory("")} style={[styles.chip, !category && styles.chipActive]}>
          <Text style={[styles.chipText, !category && styles.chipTextActive]}>सबै</Text>
        </TouchableOpacity>
        {categories?.map((c: string) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{CATEGORY_LABELS_NE[c] || c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}

      <FlatList
        data={results?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>कुनै नजिर भेटिएन।</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setViewingId(item.id);
              setInDocSearch("");
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.category && (
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{CATEGORY_LABELS_NE[item.category] || item.category}</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
              {item.court && <Text style={styles.cardMeta}>{item.court}</Text>}
              {item.caseNumber && <Text style={styles.cardMeta}>{item.caseNumber}</Text>}
              {item.decisionDate && <Text style={styles.cardMeta}>मिति: {item.decisionDate}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!viewingId} animationType="slide" onRequestClose={() => setViewingId(null)}>
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {detail?.title}
            </Text>
            <TouchableOpacity onPress={() => setViewingId(null)}>
              <Ionicons name="close" size={26} color="#111827" />
            </TouchableOpacity>
          </View>

          {loadingDetail && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          )}

          {detail && !loadingDetail && (
            <>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="यो फैसला भित्र शब्द खोज्नुहोस्..."
                  value={inDocSearch}
                  onChangeText={setInDocSearch}
                />
              </View>
              <DocumentSearchViewer text={detail.fullContent} term={inDocSearch} />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chipRow: { maxHeight: 52, marginTop: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F3F4F6", justifyContent: "center" },
  chipActive: { backgroundColor: "#2563EB" },
  chipText: { fontSize: 13, color: "#374151", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  cardTitle: { fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 11, color: "#6B7280" },
  categoryChip: { backgroundColor: "#EFF6FF", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" },
  categoryChipText: { fontSize: 10, color: "#2563EB", fontWeight: "700" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalTitle: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 12 },
  matchBar: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#F9FAFB", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  matchCount: { fontSize: 13, color: "#6B7280", marginRight: "auto" },
});
