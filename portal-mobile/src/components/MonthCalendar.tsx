import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/theme";

interface MonthCalendarProps {
  markedDates: Set<string>; // "YYYY-MM-DD" strings that have at least one hearing
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function MonthCalendar({ markedDates, selectedDate, onSelectDate }: MonthCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString([], { month: "long", year: "numeric" });
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={goNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) return <View key={idx} style={styles.cell} />;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const hasHearing = markedDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <TouchableOpacity key={idx} style={styles.cell} onPress={() => onSelectDate(dateStr)}>
              <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected, isToday && !isSelected && styles.dayCircleToday]}>
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
              </View>
              {hasHearing && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = "14.28%"; // 100/7

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  navButton: { padding: spacing.xs },
  monthLabel: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  weekRow: { flexDirection: "row" },
  weekdayText: { width: CELL_SIZE as any, textAlign: "center", fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: CELL_SIZE as any, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  dayCircleToday: { borderWidth: 1.5, borderColor: colors.primary },
  dayCircleSelected: { backgroundColor: colors.primary },
  dayText: { fontSize: 13, color: colors.textPrimary },
  dayTextSelected: { color: "#fff", fontWeight: "700" },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent, marginTop: 2 },
  dotSelected: { backgroundColor: colors.primary },
});
