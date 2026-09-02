import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useMyDocuments, useMyCases, useUploadDocument } from "../../src/hooks/useDomainData";
import { downloadAndShareDocument } from "../../src/utils/downloadDocument";
import { Card } from "../../src/components/Card";
import { colors, spacing } from "../../src/theme/theme";
import { CaseDocument } from "../../src/types";

export default function DocumentsScreen() {
  const { data, isLoading } = useMyDocuments();
  const { data: cases } = useMyCases();
  const uploadDocument = useUploadDocument();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [casePickerOpen, setCasePickerOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);

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

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const file = result.assets[0];
    setPendingFile({ uri: file.uri, name: file.name, mimeType: file.mimeType || "application/octet-stream" });

    if (!cases || cases.length === 0) {
      Alert.alert("No case found", "You need to be linked to a case before uploading documents.");
      return;
    }
    if (cases.length === 1) {
      // Only one case -- skip the picker and upload directly to it.
      handleUploadToCase(cases[0].id, file.uri, file.name, file.mimeType || "application/octet-stream");
    } else {
      setCasePickerOpen(true);
    }
  };

  const handleUploadToCase = (caseId: string, uri: string, name: string, mimeType: string) => {
    uploadDocument.mutate(
      { caseId, category: "OTHER", fileUri: uri, fileName: name, mimeType },
      {
        onSuccess: () => {
          setCasePickerOpen(false);
          setPendingFile(null);
          Alert.alert("Uploaded", "Your document was uploaded successfully.");
        },
        onError: (err: any) => {
          Alert.alert("Upload failed", err?.response?.data?.message || "Could not upload this document.");
        },
      }
    );
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
      <TouchableOpacity style={styles.uploadButton} onPress={handlePickFile} disabled={uploadDocument.isPending}>
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        <Text style={styles.uploadButtonText}>{uploadDocument.isPending ? "Uploading..." : "Upload Document"}</Text>
      </TouchableOpacity>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No documents shared yet.</Text> : <Text style={styles.emptyText}>Loading...</Text>
        }
      />

      <Modal visible={casePickerOpen} transparent animationType="slide" onRequestClose={() => setCasePickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Which case is this for?</Text>
            {cases?.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.caseOption}
                onPress={() => pendingFile && handleUploadToCase(c.id, pendingFile.uri, pendingFile.name, pendingFile.mimeType)}
              >
                <Text style={styles.caseOptionText}>{c.caseTitle}</Text>
                <Text style={styles.caseOptionSub}>{c.caseNumber}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setCasePickerOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  uploadButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, marginBottom: spacing.md, gap: 8 },
  uploadButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  modalTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.md },
  caseOption: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  caseOptionText: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  caseOptionSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cancelButton: { alignItems: "center", paddingVertical: 12 },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
});
