import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useCases, useCreateHearing } from "../../src/hooks/useDomainData";
import { PickerModal } from "../../src/components/PickerModal";
import { colors, spacing, radius } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";

export default function CreateHearingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: cases } = useCases();
  const createHearing = useCreateHearing();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [casePickerOpen, setCasePickerOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [judge, setJudge] = useState("");
  const [remarks, setRemarks] = useState("");

  const caseOptions = (cases?.items ?? []).map((c) => ({ id: c.id, label: c.caseTitle, sublabel: c.caseNumber }));
  const selectedCase = caseOptions.find((c) => c.id === caseId);

  const openDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: "time",
              onChange: (_, selectedTime) => {
                if (selectedTime) setDate(selectedTime);
              },
            });
          }
        },
      });
    } else {
      setShowPicker(true);
    }
  };

  const handleSubmit = () => {
    if (!caseId) {
      Alert.alert("Missing case", "Please select a case for this hearing.");
      return;
    }
    createHearing.mutate(
      { caseId, hearingDate: date.toISOString(), judge: judge || undefined, remarks: remarks || undefined },
      {
        onSuccess: () => {
          Alert.alert("Success", "Hearing scheduled — reminders will be sent automatically.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not schedule hearing.");
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>{t("cases")} *</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setCasePickerOpen(true)}>
        <Text style={selectedCase ? styles.selectorText : styles.selectorPlaceholder}>
          {selectedCase ? `${selectedCase.sublabel} — ${selectedCase.label}` : t("selectCase")}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.label}>{t("hearingDate")} *</Text>
      <TouchableOpacity style={styles.selector} onPress={openDatePicker}>
        <Text style={styles.selectorText}>{date.toLocaleString()}</Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {Platform.OS === "ios" && showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="spinner"
          onChange={(_, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>{t("judge")}</Text>
      <TextInput style={styles.input} value={judge} onChangeText={setJudge} placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>{t("remarks")}</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: "top" }]}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={createHearing.isPending}>
        <Text style={styles.submitButtonText}>
          {createHearing.isPending ? "Saving..." : "Schedule Hearing"}
        </Text>
      </TouchableOpacity>

      <PickerModal
        visible={casePickerOpen}
        title={t("selectCase")}
        options={caseOptions}
        selectedIds={caseId ? [caseId] : []}
        onConfirm={(ids) => {
          setCaseId(ids[0] ?? null);
          setCasePickerOpen(false);
        }}
        onClose={() => setCasePickerOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  selectorText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  selectorPlaceholder: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  submitButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});