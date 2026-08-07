import { useState } from "react";
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { contentGeneratorApi } from "../../api/contentGenerator.api";
import { libraryApi } from "../../api/library.api";

export function ContentGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [sector, setSector] = useState("");
  const [audienceLevel, setAudienceLevel] = useState("COLLEGE");
  const [length, setLength] = useState("MEDIUM");
  const [generatedContent, setGeneratedContent] = useState("");
  const [saved, setSaved] = useState(false);

  const generate = useMutation({
    mutationFn: () => contentGeneratorApi.generate({ topic, sector: sector || undefined, audienceLevel, length }),
    onSuccess: (content) => {
      setGeneratedContent(content);
      setSaved(false);
    },
  });

  const saveToLibrary = useMutation({
    mutationFn: () =>
      libraryApi.create({
        title: topic,
        type: "NOTE",
        category: sector || undefined,
        content: generatedContent,
        isDownloadable: true,
      }),
    onSuccess: () => setSaved(true),
  });

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        AI Content Generator
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate original study notes for any topic — school subjects, law, IELTS, construction safety, or any other
        sector. Content is always written fresh, never copied from copyrighted sources.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3, mb: 3 }}>
        {generate.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(generate.error as any)?.response?.data?.message || "Failed to generate content"}
          </Alert>
        )}
        <TextField
          label="Topic"
          placeholder="e.g. Newton's Laws of Motion, Fundamental Rights in Nepal's Constitution, Scaffolding Safety Basics"
          fullWidth
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Sector (optional)"
          placeholder="e.g. School Science, Nepal Law, IELTS, Construction"
          fullWidth
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField select label="Audience Level" fullWidth value={audienceLevel} onChange={(e) => setAudienceLevel(e.target.value)}>
            <MenuItem value="SCHOOL">School Student</MenuItem>
            <MenuItem value="COLLEGE">College / Exam-Prep</MenuItem>
            <MenuItem value="PROFESSIONAL">Working Professional</MenuItem>
          </TextField>
          <TextField select label="Length" fullWidth value={length} onChange={(e) => setLength(e.target.value)}>
            <MenuItem value="SHORT">Short</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="DETAILED">Detailed</MenuItem>
          </TextField>
        </Box>
        <Button variant="contained" onClick={() => generate.mutate()} disabled={!topic || generate.isPending}>
          {generate.isPending ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Generate Content"}
        </Button>
      </Paper>

      {generatedContent && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Generated Content (editable before saving)
          </Typography>
          <TextField
            multiline
            fullWidth
            minRows={10}
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          {saved && <Alert severity="success" sx={{ mb: 2 }}>Saved to Library as a Note.</Alert>}
          <Button variant="contained" color="secondary" onClick={() => saveToLibrary.mutate()} disabled={saveToLibrary.isPending}>
            {saveToLibrary.isPending ? "Saving..." : "Save to Library"}
          </Button>
        </Paper>
      )}
    </Box>
  );
}
