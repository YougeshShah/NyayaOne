import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMyCaseDetail } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/theme/theme";

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: caseData, isLoading } = useMyCaseDetail(id);

  if (isLoading || !caseData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const leadLawyer = caseData.lawyers.find((l) => l.isLead)?.lawyer || caseData.lawyers[0]?.lawyer;

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
      </Card>

      {leadLawyer && (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Your Lawyer</Text>
          <Text style={styles.lawyerName}>{leadLawyer.fullName}</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL(`mailto:${leadLawyer.email}`)}>
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
              <Text style={styles.contactText}>{leadLawyer.email}</Text>
            </TouchableOpacity>
            {leadLawyer.phone && (
              <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL(`tel:${leadLawyer.phone}`)}>
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <Text style={styles.contactText}>{leadLawyer.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

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
  lawyerName: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.sm },
  contactRow: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  contactButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  hearingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hearingDate: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  hearingJudge: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 13, color: colors.textSecondary },
});
