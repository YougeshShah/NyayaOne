import { useMemo } from "react";
import { Box, Chip, Typography } from "@mui/material";

interface TemplateField {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  autoFillSource?: string;
}

interface InlineDocumentFillFormProps {
  bodyTemplate: string;
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

type Segment = { type: "text"; value: string } | { type: "field"; field: TemplateField };

// Splits the raw template body into a flat sequence of plain-text chunks
// and field references, in original document order — this is what lets
// the UI render the actual document flow with inputs sitting exactly
// where each blank was in the source form, instead of a separate list of
// fields disconnected from their context.
function splitIntoSegments(bodyTemplate: string, fieldMap: Map<string, TemplateField>): Segment[] {
  const parts: Segment[] = [];
  const regex = /\{\{(\w+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(bodyTemplate)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: bodyTemplate.slice(lastIndex, match.index) });
    }
    const field = fieldMap.get(match[1]);
    if (field) {
      parts.push({ type: "field", field });
    } else {
      // Placeholder with no matching field definition -- show the raw tag
      // rather than silently dropping it, so a data inconsistency is
      // visible instead of hidden.
      parts.push({ type: "text", value: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < bodyTemplate.length) {
    parts.push({ type: "text", value: bodyTemplate.slice(lastIndex) });
  }
  return parts;
}

export function InlineDocumentFillForm({ bodyTemplate, fields, values, onChange }: InlineDocumentFillFormProps) {
  const fieldMap = useMemo(() => new Map(fields.map((f) => [f.key, f])), [fields]);
  const segments = useMemo(() => splitIntoSegments(bodyTemplate, fieldMap), [bodyTemplate, fieldMap]);

  const hasAutoFields = fields.some((f) => f.autoFillSource);
  const hasManualFields = fields.some((f) => !f.autoFillSource);

  return (
    <Box>
      {(hasAutoFields || hasManualFields) && (
        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
          {hasAutoFields && (
            <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#16A34A" }} /> स्वतः भरिने
            </Typography>
          )}
          {hasManualFields && (
            <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#2563EB" }} /> यहाँ टाइप गर्नुहोस्
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 2,
          p: 2.5,
          maxHeight: 420,
          overflowY: "auto",
          fontSize: 14,
          lineHeight: 2.4,
          whiteSpace: "pre-wrap",
          bgcolor: "#fff",
        }}
      >
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.value}</span>;

          const field = seg.field;

          if (field.autoFillSource) {
            return (
              <Chip
                key={i}
                label={field.label}
                size="small"
                sx={{
                  mx: 0.4,
                  height: 22,
                  fontSize: 11,
                  verticalAlign: "middle",
                  bgcolor: "#F0FDF4",
                  color: "#166534",
                  border: "1px solid #BBF7D0",
                }}
              />
            );
          }

          return (
            <input
              key={i}
              type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
              placeholder={field.label}
              title={field.label}
              value={values[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
              style={{
                display: "inline-block",
                minWidth: field.type === "textarea" ? 220 : 100,
                maxWidth: 280,
                margin: "0 3px",
                padding: "2px 8px",
                fontSize: 13,
                fontFamily: "inherit",
                border: "none",
                borderBottom: "1.5px solid #2563EB",
                background: "#EFF6FF",
                borderRadius: "4px 4px 0 0",
                outline: "none",
                verticalAlign: "middle",
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
