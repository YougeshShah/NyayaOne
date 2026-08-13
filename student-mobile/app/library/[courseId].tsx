import { useState, useRef, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Linking, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../../src/hooks";
import Constants from "expo-constants";

// Splits text on the search term so matches can be rendered as highlighted
// <Text> spans — lets a student find every occurrence of a keyword inside
// a long Act/Book/Note without downloading it first.
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

// React Native has no scrollIntoView, and measuring inline <Text> spans is
// unreliable — instead this splits the document into paragraphs, tracks
// each paragraph's Y position via onLayout (which IS reliable for block
// elements), and scrolls the ScrollView to whichever paragraph holds the
// currently "active" match. Less precise than a browser's Find, but a
// student is still taken to the right area of a long document instead of
// only seeing that a match exists somewhere off-screen.
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

  // Finds which paragraph the Nth overall match falls in, and that match's
  // index within that paragraph (since HighlightedText highlights per
  // paragraph, not globally).
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
          <Text style={docSearchStyles.matchCount}>
            {totalMatches > 0 ? `${activeMatchIndex + 1} / ${totalMatches}` : "0 / 0"}
          </Text>
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
          <View key={i} onLayout={(e) => (paragraphYPositions.current[i] = e.nativeEvent.layout.y)} style={{ marginBottom: 12 }}>
            <HighlightedText text={p} term={term} activeInThisParagraph={i === activeParagraph ? activeLocalIndex : null} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const docSearchStyles = StyleSheet.create({
  matchBar: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#F9FAFB", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  matchCount: { fontSize: 13, color: "#6B7280", marginRight: "auto" },
});

export default function LibraryScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useLibrary(courseId, search || undefined);
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [viewerSearch, setViewerSearch] = useState("");

  const apiBase = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "";
  const staticBase = apiBase.replace(/\/api\/v\d+\/?$/, "");

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search titles or document text..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name="document-text-outline" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.type}>{item.type}</Text>
                <Text style={styles.title}>{item.title}</Text>
                {item.content && (
                  <Text style={styles.content} numberOfLines={3}>
                    {item.content}
                  </Text>
                )}
                <View style={{ flexDirection: "row", gap: 16, marginTop: 6 }}>
                  {item.content && (
                    <TouchableOpacity
                      onPress={() => {
                        setViewingItem(item);
                        setViewerSearch("");
                      }}
                    >
                      <Text style={styles.viewLink}>View</Text>
                    </TouchableOpacity>
                  )}
                  {item.fileUrl && item.isDownloadable && (
                    <TouchableOpacity onPress={() => Linking.openURL(`${staticBase}/${item.fileUrl}`)}>
                      <Text style={styles.download}>Download</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", color: "#6B7280", marginTop: 40 }}>No resources here yet.</Text>}
        />
      )}

      <Modal visible={!!viewingItem} animationType="slide" onRequestClose={() => setViewingItem(null)}>
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {viewingItem?.title}
            </Text>
            <TouchableOpacity onPress={() => setViewingItem(null)}>
              <Ionicons name="close" size={26} color="#111827" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Find a word or phrase in this document..."
              value={viewerSearch}
              onChangeText={setViewerSearch}
            />
          </View>
          <DocumentSearchViewer text={viewingItem?.content ?? ""} term={viewerSearch} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F3F4F6", borderRadius: 10, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, fontSize: 14 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  type: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  title: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  content: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  download: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
  viewLink: { color: "#16A34A", fontWeight: "700", fontSize: 13 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalTitle: { fontSize: 17, fontWeight: "700", flex: 1, marginRight: 12 },
  modalContent: { fontSize: 14, lineHeight: 22, color: "#1F2937" },
});
