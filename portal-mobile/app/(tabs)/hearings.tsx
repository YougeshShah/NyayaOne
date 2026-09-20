import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { useAllHearings, useUpdateHearing } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { MonthCalendar } from "../../src/components/MonthCalendar";
import { colors, spacing, radius } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";
import { Hearing, HearingStatus } from "../../src/types";

const STATUS_OPTIONS: HearingStatus[] = ["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HearingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading } = useAllHearings();
  const updateHearing = useUpdateHearing();

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateStr(new Date()));
  const [selected, setSelected] = useState<Hearing | null>(null);
  const [remarks, setRemarks] = useState("");
  const [nextDate, setNextDate] = useState<Date | null>(null);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    data?.items.forEach((h) => set.add(toDateStr(new Date(h.hearingDate))));
    return set;
  }, [data]);

  const hearingsForSelectedDate = useMemo(() => {
    if (!selectedDate || !data) return [];
    return data.items
      .filter((h) => toDateStr(new Date(h.hearingDate)) === selectedDate)
      .sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
  }, [data, selectedDate]);

  const openUpdate = (h: Hearing) => {
    setSelected(h);
    setRemarks(h.remarks || "");
    setNextDate(null);
  };
  const openNextDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: nextDate || new Date(),
        mode: "date",
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: "time",
              onChange: (_, selectedTime) => {
                if (selectedTime) setNextDate(selectedTime);
              },
            });
          }
        },
      });
    } else {
      setShowNextDatePicker(true);
    }
  };

  const applyStatus = (status: HearingStatus) => {
    if (!selected) return;
    updateHearing.mutate(
      { id: selected.id, payload: { status, remarks, nextHearingDate: nextDate ? nextDate.toISOString() : undefined } },
      {
        onSuccess: () => {
          setSelected(null);
          Alert.alert("Updated", `Hearing marked as ${status}`);
        },
        onError: () => Alert.alert("Error", "Could not update hearing. Try again."),
      }
    );
  };

  const renderHearingCard = (item: Hearing) => (
    <Card key={item.id} style={{ marginBottom: spacing.sm }}>
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
        <Text style={styles.updateButtonText}>{t("updateStatus")}</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, viewMode === "calendar" && styles.toggleBtnActive]} onPress={() => setViewMode("calendar")}>
          <Text style={[styles.toggleText, viewMode === "calendar" && styles.toggleTextActive]}>{t("calendar")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]} onPress={() => setViewMode("list")}>
          <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>{t("list")}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === "calendar" ? (
        <FlatList
          data={hearingsForSelectedDate}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.md }}>
              <MonthCalendar markedDates={markedDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              <Text style={styles.sectionLabel}>
                {selectedDate ? new Date(selectedDate).toDateString() : "Select a date"}
              </Text>
            </View>
          }
          renderItem={({ item }) => renderHearingCard(item)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ListEmptyComponent={<Text style={styles.emptyText}>{t("noHearingsYet")}</Text>}
        />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderHearingCard(item)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ListEmptyComponent={
            !isLoading ? <Text style={styles.emptyText}>No hearings scheduled.</Text> : <Text style={styles.emptyText}>Loading...</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/hearing/create")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selected?.case.caseTitle}</Text>
            <Text style={styles.modalSub}>{selected?.case.caseNumber}</Text>

            <Text style={styles.modalLabel}>{t("remarks")}</Text>
            <TextInput
              style={styles.modalInput}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Add remarks about this hearing..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.modalLabel}>Next Hearing Date (optional)</Text>
            <TouchableOpacity style={styles.nextDateButton} onPress={openNextDatePicker}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={styles.nextDateText}>{nextDate ? nextDate.toLocaleString() : "Schedule next hearing for this case"}</Text>
            </TouchableOpacity>
            {Platform.OS === "ios" && showNextDatePicker && (
              <DateTimePicker
                value={nextDate || new Date()}
                mode="datetime"
                display="spinner"
                onChange={(_, selectedDate) => {
                  setShowNextDatePicker(false);
                  if (selectedDate) setNextDate(selectedDate);
                }}
              />
            )}
            <Text style={styles.modalLabel}>{t("setStatus")}</Text>
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
              <Text style={styles.cancelButtonText}>{t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toggleRow: { flexDirection: "row", padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  toggleTextActive: { color: "#fff" },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  caseTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  caseSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  judge: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
  updateButton: { marginTop: spacing.sm, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F0F0F0", alignItems: "center" },
  updateButtonText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  modalSub: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },
  modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, fontSize: 14, textAlignVertical: "top", minHeight: 70 },
  nextDateButton: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  nextDateText: { fontSize: 13, color: colors.textPrimary, flex: 1 },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs },
  statusChip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  statusChipTextActive: { color: "#fff" },
  cancelButton: { marginTop: spacing.lg, alignItems: "center", paddingVertical: 10 },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
});
