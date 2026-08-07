import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDocumentTemplates, useDocumentTemplateDetail, useGenerateDocument } from "../../src/hooks/useDocumentTemplates";
import { PickerModal } from "../../src/components/PickerModal";
import { colors, spacing, radius } from "../../src/theme/theme";

export default function GenerateDocumentScreen() {
  const { caseId, clientId } = useLocalSearchParams<{ caseId: string; clientId?: string }>();
  const router = useRouter();

  const { data: templates } = useDocumentTemplates();
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: template, isLoading: loadingTemplate } = useDocumentTemplateDetail(templateId || undefined);
  const generateDoc = useGenerateDocument();

  const categories = useMemo(() => {
    const set = new Set<string>();
    templates?.items.forEach((t) => set.add(t.category || "अन्य"));
    return Array.from(set).sort();
  }, [templates]);

  const documentsInCategory = useMemo(() => {
    if (!category) return [];
    return (templates?.items ?? []).filter((t) => (t.category || "अन्य") === category);
  }, [templates, category]);

  useEffect(() => {
    setTemplateId(null);
    setValues({});
  }, [category]);

  const manualFields = template?.fields.filter((f) => !f.autoFillSource) ?? [];
  const autoFields = template?.fields.filter((f) => f.autoFillSource) ?? [];

  const handleGenerate = () => {
    if (!templateId || !caseId) return;
    generateDoc.mutate(
      { templateId, caseId, values, clientId },
      {
        onSuccess: () => router.back(),
        onError: () => Alert.alert("Error", "Could not generate the document. Please check the fields and try again."),
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
      <Text style={styles.label}>Step 1 — Court / Category</Text>
      <TouchableOpacity style={styles.selectBox} onPress={() => setCategoryPickerOpen(true)}>
        <Text style={category ? styles.selectText : styles.selectPlaceholder}>{category || "Choose a category"}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {category && (
        <>
          <Text style={styles.label}>Step 2 — Document</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setTemplatePickerOpen(true)}>
            <Text style={template ? styles.selectText : styles.selectPlaceholder}>
              {template?.title || "Choose a document"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      )}

      {loadingTemplate && <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />}

      {template && !loadingTemplate && (
        <>
          {autoFields.length > 0 && (
            <View style={styles.autoFillBox}>
              <Text style={styles.autoFillTitle}>Filled automatically from this case:</Text>
              <View style={styles.chipRow}>
                {autoFields.map((f) => (
                  <View key={f.key} style={styles.chip}>
                    <Text style={styles.chipText}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {manualFields.map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>
                {field.label} {field.required ? "*" : ""}
              </Text>
              <TextInput
                style={[styles.input, field.type === "textarea" && styles.textarea]}
                multiline={field.type === "textarea"}
                keyboardType={field.type === "number" ? "numeric" : "default"}
                value={values[field.key] || ""}
                onChangeText={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={generateDoc.isPending}>
            {generateDoc.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={styles.generateButtonText}>Generate PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      <PickerModal
        visible={categoryPickerOpen}
        title="Choose a Category"
        options={categories.map((c) => ({ id: c, label: c }))}
        selectedIds={category ? [category] : []}
        onClose={() => setCategoryPickerOpen(false)}
        onConfirm={(ids) => {
          setCategory(ids[0] || null);
          setCategoryPickerOpen(false);
        }}
      />

      <PickerModal
        visible={templatePickerOpen}
        title="Choose a Document"
        options={documentsInCategory.map((t) => ({ id: t.id, label: t.title }))}
        selectedIds={templateId ? [templateId] : []}
        onClose={() => setTemplatePickerOpen(false)}
        onConfirm={(ids) => {
          setTemplateId(ids[0] || null);
          setTemplatePickerOpen(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.md, marginBottom: 6 },
  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  selectText: { fontSize: 14, color: colors.textPrimary },
  selectPlaceholder: { fontSize: 14, color: "#9CA3AF" },
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
  textarea: { minHeight: 80, textAlignVertical: "top" },
  autoFillBox: { backgroundColor: "#F0FDF4", borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  autoFillTitle: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 11, color: "#166534", fontWeight: "600" },
  generateButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.xl,
  },
  generateButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
