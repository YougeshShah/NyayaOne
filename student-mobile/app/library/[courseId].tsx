import { View, Text, FlatList, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../../src/hooks";
import Constants from "expo-constants";

export default function LibraryScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { data, isLoading } = useLibrary(courseId);

  const apiBase = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "";
  const staticBase = apiBase.replace(/\/api\/v\d+\/?$/, "");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
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
            {item.fileUrl && item.isDownloadable && (
              <Text style={styles.download} onPress={() => Linking.openURL(`${staticBase}/${item.fileUrl}`)}>
                Download
              </Text>
            )}
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={{ textAlign: "center", color: "#6B7280", marginTop: 40 }}>No resources here yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  type: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  title: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  content: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  download: { color: "#2563EB", fontWeight: "700", fontSize: 13, marginTop: 6 },
});
