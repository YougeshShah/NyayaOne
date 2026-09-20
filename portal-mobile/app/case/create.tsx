import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCourts, useClients, useLawyers, useCreateCase } from "../../src/hooks/useDomainData";
import { PickerModal } from "../../src/components/PickerModal";
import { colors, spacing, radius } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export default function CreateCaseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: courts } = useCourts();
  const { data: clients } = useClients();
  const { data: lawyers } = useLawyers();
  const createCase = useCreateCase();

  const [caseNumber, setCaseNumber] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("MEDIUM");
  const [opposingParty, setOpposingParty] = useState("");

  const [courtId, setCourtId] = useState<string | null>(null);
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [lawyerIds, setLawyerIds] = useState<string[]>([]);

  const [courtPickerOpen, setCourtPickerOpen] = useState(false);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [lawyerPickerOpen, setLawyerPickerOpen] = useState(false);

  const courtOptions = (courts?.items ?? []).map((c) => ({ id: c.id, label: c.name, sublabel: `${c.type}${c.province ? " — " + c.province : ""}` }));
  const clientOptions = (clients?.items ?? []).map((c) => ({ id: c.id, label: c.fullName, sublabel: c.phone || undefined }));
  const lawyerOptions = (lawyers ?? []).map((l) => ({ id: l.id, label: l.fullName, sublabel: l.email }));

  const selectedCourt = courtOptions.find((c) => c.id === courtId);

  const handleSubmit = () => {
    if (!caseNumber || !caseTitle || !courtId || clientIds.length === 0 || lawyerIds.length === 0) {
      Alert.alert("Missing fields", "Case number, title, court, at least one client, and at least one lawyer are required.");
      return;
    }
    createCase.mutate(
      {
        caseNumber,
        caseTitle,
        courtId,
        clientIds,
        lawyerIds,
        leadLawyerId: lawyerIds[0],
        priority,
        opposingParty: opposingParty || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Case created successfully.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not create case.");
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>{t("caseNumber")} *</Text>
      <TextInput style={styles.input} value={caseNumber} onChangeText={setCaseNumber} placeholder="e.g. CASE-2026-002" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>{t("caseTitle")} *</Text>
      <TextInput style={styles.input} value={caseTitle} onChangeText={setCaseTitle} placeholder="e.g. Property Dispute" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>{t("court")} *</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setCourtPickerOpen(true)}>
        <Text style={selectedCourt ? styles.selectorText : styles.selectorPlaceholder}>{selectedCourt?.label || t("selectCourt")}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.label}>Clients * ({clientIds.length} selected)</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setClientPickerOpen(true)}>
        <Text style={clientIds.length ? styles.selectorText : styles.selectorPlaceholder}>
          {clientIds.length ? clientOptions.filter((c) => clientIds.includes(c.id)).map((c) => c.label).join(", ") : t("selectClients")}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.label}>{t("assignedLawyers")} * ({lawyerIds.length} selected)</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setLawyerPickerOpen(true)}>
        <Text style={lawyerIds.length ? styles.selectorText : styles.selectorPlaceholder}>
          {lawyerIds.length ? lawyerOptions.filter((l) => lawyerIds.includes(l.id)).map((l) => l.label).join(", ") : t("selectLawyers")}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity key={p} style={[styles.priorityChip, priority === p && styles.priorityChipActive]} onPress={() => setPriority(p)}>
            <Text style={[styles.priorityChipText, priority === p && styles.priorityChipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Opposing Party</Text>
      <TextInput style={styles.input} value={opposingParty} onChangeText={setOpposingParty} placeholderTextColor="#9CA3AF" />


      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={createCase.isPending}>
        <Text style={styles.submitText}>{createCase.isPending ? t("creating") : t("createCase")}</Text>
      </TouchableOpacity>

      <PickerModal
        visible={courtPickerOpen}
        title={t("selectCourt")}
        options={courtOptions}
        selectedIds={courtId ? [courtId] : []}
        onClose={() => setCourtPickerOpen(false)}
        onConfirm={(ids) => setCourtId(ids[0] ?? null)}
      />
      <PickerModal
        visible={clientPickerOpen}
        title={t("selectClients")}
        options={clientOptions}
        selectedIds={clientIds}
        multiple
        onClose={() => setClientPickerOpen(false)}
        onConfirm={setClientIds}
      />
      <PickerModal
        visible={lawyerPickerOpen}
        title={t("selectLawyers")}
        options={lawyerOptions}
        selectedIds={lawyerIds}
        multiple
        onClose={() => setLawyerPickerOpen(false)}
        onConfirm={setLawyerIds}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  selector: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: { fontSize: 14, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  selectorPlaceholder: { fontSize: 14, color: "#9CA3AF", flex: 1 },
  priorityRow: { flexDirection: "row", gap: spacing.sm },
  priorityChip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  priorityChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  priorityChipText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  priorityChipTextActive: { color: "#fff" },
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
