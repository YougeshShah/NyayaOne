import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usageLimitApi, CourseOption } from "../src/api/usageLimit.api";
import { colors, spacing, radius } from "../src/theme/theme";

export default function UsageLimitScreen() {
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
  const { data: courses } = useQuery({ queryKey: ["usage-limit-courses"], queryFn: () => usageLimitApi.courses() });
  const isLanguageCourse = selectedCourse?.category === "LANGUAGE";

  const queryClient = useQueryClient();
  const { data: currentLimit } = useQuery({
    queryKey: ["usage-limit-institution", selectedCourse?.id],
    queryFn: () => usageLimitApi.getAsInstitution(selectedCourse!.id),
    enabled: !!selectedCourse,
  });

  const [practiceLimit, setPracticeLimit] = useState("");
  const [mockTestLimit, setMockTestLimit] = useState("");
  const [speakingLimit, setSpeakingLimit] = useState("");

  useEffect(() => {
    setPracticeLimit(currentLimit?.practiceLimit != null ? String(currentLimit.practiceLimit) : "");
    setMockTestLimit(currentLimit?.mockTestLimit != null ? String(currentLimit.mockTestLimit) : "");
    setSpeakingLimit(currentLimit?.speakingLimit != null ? String(currentLimit.speakingLimit) : "");
  }, [currentLimit]);

  const save = useMutation({
    mutationFn: () =>
      usageLimitApi.setAsInstitution({
        courseId: selectedCourse!.id,
        practiceLimit: practiceLimit === "" ? null : Number(practiceLimit),
        mockTestLimit: mockTestLimit === "" ? null : Number(mockTestLimit),
        speakingLimit: speakingLimit === "" ? null : Number(speakingLimit),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usage-limit-institution"] });
      Alert.alert("Saved", "Usage limits updated.");
    },
    onError: (err: any) => Alert.alert("Error", err?.response?.data?.message || "Could not save limits."),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usage Limits</Text>
        <View style={{ width: 22 }} />
      </View>
      <Text style={styles.subtitle}>
        Sets your own policy for your students on this course — overrides the platform default. Leave blank to use the platform default.
      </Text>

      <Text style={styles.label}>Course</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {(courses ?? []).map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.courseChip, selectedCourse?.id === c.id && styles.courseChipActive]}
            onPress={() => setSelectedCourse(c)}
          >
            <Text style={[styles.courseChipText, selectedCourse?.id === c.id && styles.courseChipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCourse && (
        <View style={styles.card}>
          <Text style={styles.label}>Practice Limit</Text>
          <Text style={styles.helperText}>How many times students may open Practice</Text>
          <TextInput
            style={styles.input}
            value={practiceLimit}
            onChangeText={setPracticeLimit}
            keyboardType="number-pad"
            placeholder="Platform default"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Mock Test Limit</Text>
          <Text style={styles.helperText}>How many mock test attempts students may take</Text>
          <TextInput
            style={styles.input}
            value={mockTestLimit}
            onChangeText={setMockTestLimit}
            keyboardType="number-pad"
            placeholder="Platform default"
            placeholderTextColor="#9CA3AF"
          />

          {isLanguageCourse && (
            <>
              <Text style={styles.label}>Speaking Test Limit</Text>
              <Text style={styles.helperText}>How many speaking test recordings students may submit</Text>
              <TextInput
                style={styles.input}
                value={speakingLimit}
                onChangeText={setSpeakingLimit}
                keyboardType="number-pad"
                placeholder="Platform default"
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={() => save.mutate()} disabled={save.isPending}>
            <Text style={styles.saveButtonText}>{save.isPending ? "Saving..." : "Save Limits"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.md, marginBottom: 4 },
  helperText: { fontSize: 11, color: "#9CA3AF", marginBottom: 6 },
  courseChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  courseChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  courseChipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  courseChipTextActive: { color: "#fff" },
  card: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, fontSize: 14, color: colors.textPrimary },
  saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
