import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBookmarks, useToggleBookmark } from "../../src/hooks";

export default function BookmarksScreen() {
  const { data, isLoading } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.type}>{item.resourceType}</Text>
            <Text style={styles.preview} numberOfLines={2}>
              {item.preview}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark.mutate({ resourceType: item.resourceType, resourceId: item.resourceId })}>
            <Ionicons name="trash-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Ionicons name="bookmark-outline" size={40} color="#D1D5DB" />
          <Text style={{ color: "#6B7280", marginTop: 12, textAlign: "center" }}>
            No bookmarks yet — tap the bookmark icon on any question to save it here.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  type: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", marginBottom: 4 },
  preview: { fontSize: 14 },
});
