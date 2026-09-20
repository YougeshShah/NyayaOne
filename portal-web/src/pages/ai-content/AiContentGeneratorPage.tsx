import { useState } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, Alert, CircularProgress } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import { useMutation } from "@tanstack/react-query";
import { aiContentApi } from "../../api/aiContent.api";

const DOCUMENT_TYPES = [
  "Legal Notice",
  "Client Engagement Letter",
  "Demand Letter",
  "Affidavit (सपथपत्र)",
  "Power of Attorney (मुख्तियारनामा)",
  "Rental/Lease Agreement",
  "NDA (Non-Disclosure Agreement)",
  "Student Welcome Email",
  "Course Announcement",
  "Other (describe below)",
];

export function AiContentGeneratorPage() {
  const [documentType, setDocumentType] = useState("Legal Notice");
  const [customType, setCustomType] = useState("");
  const [details, setDetails] = useState("");
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const [copied, setCopied] = useState(false);

  const generate = useMutation({
    mutationFn: () => aiContentApi.generate(documentType === "Other (describe below)" ? customType : documentType, details, language),
  });

  const handleCopy = () => {
    if (generate.data?.content) {
      navigator.clipboard.writeText(generate.data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        AI Content Generator
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate a first draft of common documents and messages. Always review and edit before use — this is a
        starting point, not a finished, legally-reviewed document.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField select label="Document Type" fullWidth value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
            {DOCUMENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Language" sx={{ minWidth: 160 }} value={language} onChange={(e) => setLanguage(e.target.value as "en" | "ne")}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ne">Nepali</MenuItem>
          </TextField>
        </Box>

        {documentType === "Other (describe below)" && (
          <TextField
            label="What kind of document?"
            fullWidth
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          label="Details (names, dates, key facts, purpose...)"
          multiline
          minRows={5}
          fullWidth
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="e.g. Client: Ram Sharma. Issue: Tenant hasn't paid rent for 2 months (Jan-Feb 2026). Property: Kathmandu-10. Requesting payment within 15 days or legal action will follow."
        />

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => generate.mutate()}
          disabled={!details.trim() || generate.isPending || (documentType === "Other (describe below)" && !customType.trim())}
        >
          {generate.isPending ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Generate Draft"}
        </Button>

        {generate.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(generate.error as any)?.response?.data?.message || "Something went wrong. Please try again."}
          </Alert>
        )}
      </Paper>

      {generate.data?.content && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Generated Draft</Typography>
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {generate.data.content}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
