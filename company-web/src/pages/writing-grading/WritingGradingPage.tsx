import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  Button,
  Divider,
  Slider,
  CircularProgress,
} from "@mui/material";
import { usePendingWritingSubmissions, useGradeWriting } from "../../hooks/useWritingGrading";

export function WritingGradingPage() {
  const { data: submissions, isLoading } = usePendingWritingSubmissions();
  const gradeWriting = useGradeWriting();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  const handleGrade = (id: string) => {
    const score = scores[id] ?? 5;
    gradeWriting.mutate({ id, score, feedback: feedbacks[id] });
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Writing Grading Queue
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        IELTS-style essays can't be auto-graded — review each submission and assign a band score (0–9).
      </Typography>

      {isLoading && <CircularProgress size={24} />}

      {!isLoading && (submissions ?? []).length === 0 && (
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #E5E7EB", borderRadius: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No essays waiting for review — all caught up! 🎉
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {submissions?.map((sub) => (
          <Paper key={sub.id} elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {sub.student.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sub.student.email} · {sub.section.title}
                </Typography>
              </Box>
              <Chip
                label={`${sub.wordCount} words${sub.section.minWordCount ? ` / ${sub.section.minWordCount} min` : ""}`}
                size="small"
                color={sub.section.minWordCount && sub.wordCount < sub.section.minWordCount ? "warning" : "default"}
              />
            </Box>

            {sub.section.writingPrompt && (
              <Typography variant="body2" sx={{ mb: 1.5, p: 1.5, bgcolor: "#F9FAFB", borderRadius: 1 }}>
                <strong>Prompt:</strong> {sub.section.writingPrompt}
              </Typography>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
              {sub.essayText}
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Band Score: {scores[sub.id] ?? 5}
            </Typography>
            <Slider
              value={scores[sub.id] ?? 5}
              onChange={(_, val) => setScores((prev) => ({ ...prev, [sub.id]: val as number }))}
              min={0}
              max={9}
              step={0.5}
              marks
              sx={{ maxWidth: 400, mb: 2 }}
            />

            <TextField
              label="Feedback (optional)"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={feedbacks[sub.id] ?? ""}
              onChange={(e) => setFeedbacks((prev) => ({ ...prev, [sub.id]: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <Button variant="contained" onClick={() => handleGrade(sub.id)} disabled={gradeWriting.isPending}>
              {gradeWriting.isPending ? "Submitting..." : "Submit Grade"}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
