import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useCaseDetail } from "../../src/hooks/useDomainData";
import { useCaseDocuments, useUploadDocument, useDeleteCaseDocument, useDownloadCaseDocument } from "../../src/hooks/useDocuments";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";

export default function CaseDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: caseData, isLoading } = useCaseDetail(id);
  const { data: documents } = useCaseDocuments(id);
  const uploadDoc = useUploadDocument(id);
  const deleteDoc = useDeleteCaseDocument(id);
  const downloadDoc = useDownloadCaseDocument();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (isLoading || !caseData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const handlePickAndUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    uploadDoc.mutate(
      { category: "OTHER", file: { uri: asset.uri, name: asset.name, mimeType: asset.mimeType || "application/octet-stream" } },
      {
        onError: () => Alert.alert("Error", "Could not upload document."),
      }
    );
  };

  const handleDownload = async (docId: string, fileName: string) => {
    setDownloadingId(docId);
    try {
      await downloadDoc.mutateAsync({ id: docId, fileName });
    } catch {
      Alert.alert("Error", "Could not download document.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{caseData.caseTitle}</Text>
        <StatusBadge status={caseData.status} />
      </View>
      <Text style={styles.caseNumber}>{caseData.caseNumber}</Text>

      <Card style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
        <InfoRow label={t("court")} value={`${caseData.court.name} (${caseData.court.type})`} />
        <InfoRow label={t("judge")} value={caseData.judge || "—"} />
        <InfoRow label={t("opposingParty")} value={caseData.opposingParty || "—"} />
        <InfoRow label={t("clients2")} value={caseData.clients.map((c) => c.client.fullName).join(", ") || "—"} />
        <InfoRow
          label={t("lawyers")}
          value={caseData.lawyers.map((l) => `${l.lawyer.fullName}${l.isLead ? " (Lead)" : ""}`).join(", ") || "—"}
        />
        {caseData.remarks ? <InfoRow label={t("remarks")} value={caseData.remarks} /> : null}
      </Card>

      <Text style={styles.sectionTitle}>{t("hearingHistory")}</Text>
      {caseData.hearings.length === 0 && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.emptyText}>{t("noHearingsYet")}</Text>
        </Card>
      )}
      {caseData.hearings.map((h) => (
        <Card key={h.id} style={{ marginBottom: spacing.sm }}>
          <View style={styles.hearingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hearingDate}>{new Date(h.hearingDate).toLocaleString()}</Text>
              {h.judge && <Text style={styles.hearingJudge}>Judge: {h.judge}</Text>}
            </View>
            <StatusBadge status={h.status} />
          </View>
        </Card>
      ))}

      <View style={styles.docHeaderRow}>
        <Text style={styles.sectionTitle}>{t("documents")}</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handlePickAndUpload} disabled={uploadDoc.isPending}>
          <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
          <Text style={styles.uploadButtonText}>{uploadDoc.isPending ? "..." : t("upload")}</Text>
        </TouchableOpacity>
      </View>

      {(!documents || documents.length === 0) && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.emptyText}>{t("noDocuments")}</Text>
        </Card>
      )}
      {documents?.map((doc) => (
        <Card key={doc.id} style={{ marginBottom: spacing.sm }}>
          <View style={styles.docRow}>
            <Ionicons name="document-text-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.docName}>{doc.fileName}</Text>
              <Text style={styles.docMeta}>{doc.category.replace(/_/g, " ")}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDownload(doc.id, doc.fileName)} style={{ padding: spacing.xs }} disabled={downloadingId === doc.id}>
              {downloadingId === doc.id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="download-outline" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteDoc.mutate(doc.id)} style={{ padding: spacing.xs }}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 19, fontWeight: "800", color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  caseNumber: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  infoRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  infoLabel: { fontSize: 12, color: colors.textSecondary, width: 110 },
  infoValue: { fontSize: 13, color: colors.textPrimary, flex: 1 },
  hearingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hearingDate: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  hearingJudge: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 13, color: colors.textSecondary },
  docHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  docRow: { flexDirection: "row", alignItems: "center" },
  docName: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  docMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
