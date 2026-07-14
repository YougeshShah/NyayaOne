import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCaseDetail } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/theme/theme";

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: caseData, isLoading } = useCaseDetail(id);

  if (isLoading || !caseData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{caseData.caseTitle}</Text>
        <StatusBadge status={caseData.status} />
      </View>
      <Text style={styles.caseNumber}>{caseData.caseNumber}</Text>

      <Card style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
        <InfoRow label="Court" value={`${caseData.court.name} (${caseData.court.type})`} />
        <InfoRow label="Judge" value={caseData.judge || "—"} />
        <InfoRow label="Opposing Party" value={caseData.opposingParty || "—"} />
        <InfoRow label="Clients" value={caseData.clients.map((c) => c.client.fullName).join(", ") || "—"} />
        <InfoRow
          label="Lawyers"
          value={caseData.lawyers.map((l) => `${l.lawyer.fullName}${l.isLead ? " (Lead)" : ""}`).join(", ") || "—"}
        />
        {caseData.remarks ? <InfoRow label="Remarks" value={caseData.remarks} /> : null}
      </Card>

      <Text style={styles.sectionTitle}>Hearing History</Text>
      {caseData.hearings.length === 0 && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.emptyText}>No hearings scheduled yet.</Text>
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
});
