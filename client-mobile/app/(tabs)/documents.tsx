import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMyDocuments } from "../../src/hooks/useDomainData";
import { downloadAndShareDocument } from "../../src/utils/downloadDocument";
import { Card } from "../../src/components/Card";
import { colors, spacing } from "../../src/theme/theme";
import { CaseDocument } from "../../src/types";

export default function DocumentsScreen() {
  const { data, isLoading } = useMyDocuments();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doc: CaseDocument) => {
    setDownloadingId(doc.id);
    try {
      await downloadAndShareDocument(doc.id, doc.fileName);
    } catch {
      Alert.alert("Download failed", "Could not download this document. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const renderItem = ({ item }: { item: CaseDocument }) => (
    <Card style={{ marginBottom: spacing.sm }}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fileName}>{item.fileName}</Text>
          <Text style={styles.meta}>
            {item.category.replace(/_/g, " ")} {item.case ? `— ${item.case.caseNumber}` : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDownload(item)} disabled={downloadingId === item.id} style={styles.downloadButton}>
          {downloadingId === item.id ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="download-outline" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No documents shared yet.</Text> : <Text style={styles.emptyText}>Loading...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: `${colors.primary}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  downloadButton: { padding: spacing.xs },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
});
