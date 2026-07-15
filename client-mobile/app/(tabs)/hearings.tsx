import { View, Text, StyleSheet, SectionList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useMyHearings } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/theme/theme";
import { Hearing } from "../../src/types";

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
  const { data, isLoading } = useMyHearings(false);

  const sections = data ? groupByDate(data) : [];

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/case/${item.case.id}`)}>
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
        )}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No hearings scheduled.</Text> : <Text style={styles.emptyText}>Loading...</Text>
        }
      />
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
});
