import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Tabs, Tab, Paper, Button, CircularProgress, Chip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import { speakingApi } from "../../api/speaking.api";

export function SpeakingPromptsListPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [part, setPart] = useState(1);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["speaking-prompts-student", courseId, part],
    queryFn: () => speakingApi.listPrompts(courseId as string, part),
    enabled: !!courseId,
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ["my-speaking-submissions"],
    queryFn: () => speakingApi.listMySubmissions(),
  });

  const attemptedPromptIds = new Set(mySubmissions?.map((s) => s.promptId));

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <MicIcon color="action" />
        <Typography variant="h5" fontWeight={700}>
          Speaking Practice
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a question below. Your camera and microphone will turn on automatically once you start.
      </Typography>

      <Tabs value={part} onChange={(_, v) => setPart(v)} sx={{ mb: 3 }}>
        <Tab label="Part 1 — Introduction" value={1} />
        <Tab label="Part 2 — Cue Card" value={2} />
        <Tab label="Part 3 — Discussion" value={3} />
      </Tabs>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && prompts?.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #E5E7EB", borderRadius: 3 }}>
          <Typography color="text.secondary">No questions available for this part yet.</Typography>
        </Paper>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {prompts?.map((p) => (
          <Paper key={p.id} elevation={0} sx={{ p: 2.5, border: "1px solid #E5E7EB", borderRadius: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {p.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {p.promptText}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  {p.prepTimeSeconds ? `${p.prepTimeSeconds}s prep + ` : ""}
                  {p.speakTimeSeconds}s to speak
                </Typography>
              </Box>
              {attemptedPromptIds.has(p.id) && <Chip label="Attempted" size="small" color="success" variant="outlined" />}
            </Box>
            <Button
              variant="contained"
              startIcon={<MicIcon />}
              sx={{ mt: 2 }}
              onClick={() => navigate("/speaking/test", { state: { prompt: p } })}
            >
              {attemptedPromptIds.has(p.id) ? "Try Again" : "Start"}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
