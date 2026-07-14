import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAllHearings, useUpdateHearing } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, spacing, radius } from "../../src/theme/theme";
import { Hearing, HearingStatus } from "../../src/types";

const STATUS_OPTIONS: HearingStatus[] = ["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"];

function groupByDate(hearings: Hearing[]) {
  const groups: Record<string, Hearing[]> = {};
  for (const h of hearings) {
    const dateKey = new Date(h.hearingDate).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(h);
  }
  return Object.entries(groups)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, data]) => ({ title: date, data }));
}

export default function HearingsScreen() {
  const router = useRouter();
  const { data, isLoading } = useAllHearings();
  const updateHearing = useUpdateHearing();

  const [selected, setSelected] = useState<Hearing | null>(null);
  const [remarks, setRemarks] = useState("");

  const sections = data ? groupByDate(data.items) : [];

  const openUpdate = (h: Hearing) => {
    setSelected(h);
    setRemarks(h.remarks || "");
  };

  const applyStatus = (status: HearingStatus) => {
    if (!selected) return;
    updateHearing.mutate(
      { id: selected.id, payload: { status, remarks } },
      {
        onSuccess: () => {
          setSelected(null);
          Alert.alert("Updated", `Hearing marked as ${status}`);
        },
        onError: () => Alert.alert("Error", "Could not update hearing. Try again."),
      }
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.sm }}>
            <TouchableOpacity onPress={() => router.push(`/case/${item.case.id}`)}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.caseTitle}>{item.case.caseTitle}</Text>
                  <Text style={styles.caseSub}>
                    {item.case.caseNumber} — {new Date(item.hearingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  {item.judge && <Text style={styles.judge}>Judge: {item.judge}</Text>}
                </View>
                <StatusBadge status={item.status} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.updateButton} onPress={() => openUpdate(item)}>
              <Text style={styles.updateButtonText}>Update Status</Text>
            </TouchableOpacity>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No hearings scheduled.</Text> : <Text style={styles.emptyText}>Loading...</Text>
        }
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selected?.case.caseTitle}</Text>
            <Text style={styles.modalSub}>{selected?.case.caseNumber}</Text>

            <Text style={styles.modalLabel}>Remarks</Text>
            <TextInput
              style={styles.modalInput}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Add remarks about this hearing..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.modalLabel}>Set Status</Text>
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusChip, selected?.status === s && styles.statusChipActive]}
                  onPress={() => applyStatus(s)}
                  disabled={updateHearing.isPending}
                >
                  <Text style={[styles.statusChipText, selected?.status === s && styles.statusChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelected(null)}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  caseTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  caseSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  judge: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
  updateButton: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "center",
  },
  updateButtonText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  modalSub: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },
  modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 70,
  },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  statusChipTextActive: { color: "#fff" },
  cancelButton: { marginTop: spacing.lg, alignItems: "center", paddingVertical: 10 },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
});
