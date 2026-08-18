import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme/theme";
import { TemplateField } from "../../api/documentTemplate.api";

interface InlineDocumentFillFormProps {
  bodyTemplate: string;
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

type Segment = { type: "text"; value: string } | { type: "break" } | { type: "field"; field: TemplateField };

// Splits the template body into an ordered sequence of text chunks, line
// breaks, and field references. React Native's <Text> can't contain an
// interactive <TextInput> as a nested child the way HTML text can embed
// an inline <input> — so instead this feeds the whole sequence into a
// single flex-wrap row, where plain text and small TextInputs sit side by
// side as wrapping flex items. A dedicated "break" segment (full-width,
// zero-height) forces a line wrap at each \n in the source text, so the
// document's original paragraph structure is preserved.
function splitIntoSegments(bodyTemplate: string, fieldMap: Map<string, TemplateField>): Segment[] {
  const parts: Segment[] = [];
  const regex = /\{\{(\w+)\}\}|\n/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(bodyTemplate)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: bodyTemplate.slice(lastIndex, match.index) });
    }
    if (match[0] === "\n") {
      parts.push({ type: "break" });
    } else {
      const field = fieldMap.get(match[1]);
      parts.push(field ? { type: "field", field } : { type: "text", value: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < bodyTemplate.length) {
    parts.push({ type: "text", value: bodyTemplate.slice(lastIndex) });
  }
  return parts;
}

export function InlineDocumentFillForm({ bodyTemplate, fields, values, onChange }: InlineDocumentFillFormProps) {
  const fieldMap = new Map(fields.map((f) => [f.key, f]));
  const segments = splitIntoSegments(bodyTemplate, fieldMap);

  const hasAutoFields = fields.some((f) => f.autoFillSource);
  const hasManualFields = fields.some((f) => !f.autoFillSource);

  return (
    <View>
      {(hasAutoFields || hasManualFields) && (
        <View style={styles.legendRow}>
          {hasAutoFields && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#16A34A" }]} />
              <Text style={styles.legendText}>स्वतः भरिने</Text>
            </View>
          )}
          {hasManualFields && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>यहाँ टाइप गर्नुहोस्</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.documentBox}>
        <View style={styles.flowRow}>
          {segments.map((seg, i) => {
            if (seg.type === "break") return <View key={i} style={styles.lineBreak} />;

            if (seg.type === "text") {
              return (
                <Text key={i} style={styles.bodyText}>
                  {seg.value}
                </Text>
              );
            }

            const field = seg.field;
            if (field.autoFillSource) {
              return (
                <View key={i} style={styles.autoChip}>
                  <Text style={styles.autoChipText}>{field.label}</Text>
                </View>
              );
            }

            return (
              <TextInput
                key={i}
                style={[styles.inlineInput, field.type === "textarea" && styles.inlineInputWide]}
                placeholder={field.label}
                placeholderTextColor="#60A5FA"
                multiline={field.type === "textarea"}
                keyboardType={field.type === "number" ? "numeric" : "default"}
                value={values[field.key] || ""}
                onChangeText={(v) => onChange(field.key, v)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: { flexDirection: "row", gap: spacing.md, marginBottom: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textSecondary },
  documentBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    maxHeight: 420,
  },
  flowRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  lineBreak: { width: "100%", height: 6 },
  bodyText: { fontSize: 14, lineHeight: 24, color: colors.textPrimary },
  autoChip: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  autoChipText: { fontSize: 11, color: "#166534", fontWeight: "600" },
  inlineInput: {
    minWidth: 90,
    maxWidth: 220,
    marginHorizontal: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  inlineInputWide: { minWidth: 220 },
});
