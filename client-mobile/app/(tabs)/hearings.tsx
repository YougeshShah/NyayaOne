import { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useMyHearings } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { MonthCalendar } from "../../src/components/MonthCalendar";
import { colors, spacing } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HearingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading } = useMyHearings(false);

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateStr(new Date()));

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((h) => set.add(toDateStr(new Date(h.hearingDate))));
    return set;
  }, [data]);

  const hearingsForSelectedDate = useMemo(() => {
    if (!selectedDate || !data) return [];
    return data
      .filter((h) => toDateStr(new Date(h.hearingDate)) === selectedDate)
      .sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
  }, [data, selectedDate]);

  const renderHearingCard = (item: NonNullable<typeof data>[number]) => (
    <TouchableOpacity key={item.id} onPress={() => router.push(`/case/${item.case.id}`)}>
      <Card style={{ marginBottom: spacing.sm }}>
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
      </Card>
    </TouchableOpacity>
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
              <Text style={styles.sectionLabel}>{selectedDate ? new Date(selectedDate).toDateString() : ""}</Text>
            </View>
          }
          renderItem={({ item }) => renderHearingCard(item)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ListEmptyComponent={<Text style={styles.emptyText}>{t("noHearingsYet")}</Text>}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderHearingCard(item)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ListEmptyComponent={
            !isLoading ? <Text style={styles.emptyText}>{t("noHearingsYet")}</Text> : <Text style={styles.emptyText}>{t("loading")}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toggleRow: { flexDirection: "row", padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  toggleTextActive: { color: "#fff" },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  caseTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  caseSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  judge: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
});
