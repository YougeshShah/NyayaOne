import { useState, useRef, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, Chip, CircularProgress, Alert } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import PersonIcon from "@mui/icons-material/PersonOutline";
import { useMutation } from "@tanstack/react-query";
import { aiAssistantApi, AiAssistantSource } from "../../api/aiAssistant.api";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: AiAssistantSource[];
  isError?: boolean;
}

export function AiAssistantPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const ask = useMutation({
    mutationFn: (q: string) => aiAssistantApi.ask(q),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, sources: data.sources }]);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: msg, isError: true }]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = () => {
    if (!question.trim() || ask.isPending) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    ask.mutate(question);
    setQuestion("");
  };

  return (
    <Box sx={{ maxWidth: 800, height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        AI Legal Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ask a legal question — answers are grounded strictly in our own नजिर (precedent) database, with exact
        citations. This is a research aid, not legal advice.
      </Typography>

      <Paper
        elevation={0}
        sx={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 2, p: 2, overflow: "auto", mb: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {messages.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
            Ask something like "Property dispute cases मा K decision हुन्छ?" or "What precedents exist for
            constitutional writ petitions?"
          </Typography>
        )}
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            {m.role === "assistant" ? <SmartToyIcon color="primary" sx={{ mt: 0.5 }} /> : <PersonIcon sx={{ mt: 0.5 }} />}
            <Box sx={{ flex: 1 }}>
              {m.isError ? (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {m.text}
                </Alert>
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {m.text}
                </Typography>
              )}
              {m.sources && m.sources.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                  {m.sources.map((s) => (
                    <Chip key={s.id} label={s.title} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ))}
        {ask.isPending && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <SmartToyIcon color="primary" />
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Thinking...
            </Typography>
          </Box>
        )}
        <div ref={bottomRef} />
      </Paper>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask a legal question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          disabled={ask.isPending}
        />
        <Button variant="contained" endIcon={<SendIcon />} onClick={handleAsk} disabled={!question.trim() || ask.isPending}>
          Ask
        </Button>
      </Box>
    </Box>
  );
}
