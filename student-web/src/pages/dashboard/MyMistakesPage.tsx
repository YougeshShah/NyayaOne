import { useState } from "react";
import { Box, Typography, Paper, Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import { useMyMistakes } from "../../hooks/useCourse";
import { useCourses } from "../../hooks/useCourse";

export function MyMistakesPage() {
  const [courseId, setCourseId] = useState<string>("");
  const { data: courses } = useCourses();
  const { data: mistakes, isLoading } = useMyMistakes(courseId || undefined);

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <ReplayIcon color="action" />
        <Typography variant="h5" fontWeight={700}>
          Review Mistakes
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Every question you've gotten wrong in Practice or a Mock Test, with the correct answer shown — the
        fastest way to close your weak spots before the real exam.
      </Typography>

      <TextField select label="Filter by course" size="small" value={courseId} onChange={(e) => setCourseId(e.target.value)} sx={{ minWidth: 240, mb: 3 }}>
        <MenuItem value="">All Courses</MenuItem>
        {courses?.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && mistakes?.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #E5E7EB", borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No mistakes to review yet — either you're doing great, or you haven't practiced enough questions yet!
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {mistakes?.map((q) => (
          <Paper key={q.id} elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3 }}>
            <Chip label={q.subject?.name ?? "Question"} size="small" sx={{ mb: 1.5 }} />
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {q.question}
            </Typography>

            {q.answerType !== "FILL_BLANK" && q.answerType !== "SHORT_ANSWER" && q.answerType !== "MULTI_BLANK" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const optionText = (q as any)[`option${key}`];
                  if (!optionText) return null;
                  const isCorrect = q.correctOption === key;
                  return (
                    <Box
                      key={key}
                      sx={{
                        p: 1.25,
                        border: `1px solid ${isCorrect ? "#16A34A" : "#E5E7EB"}`,
                        bgcolor: isCorrect ? "#F0FDF4" : "#fff",
                        borderRadius: 1.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={isCorrect ? 700 : 400}>
                        {key}. {optionText} {isCorrect && "✓"}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {q.correctAnswerText && (
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: "#16A34A" }}>
                Correct answer: {q.correctAnswerText}
              </Typography>
            )}

            {q.explanation && (
              <Typography variant="body2" color="text.secondary" sx={{ pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
                <strong>Why:</strong> {q.explanation}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
