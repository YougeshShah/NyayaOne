import { useState, useRef, useEffect } from "react";
import { Box, Fab, Paper, Typography, TextField, IconButton, CircularProgress, Collapse } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { chatbotApi, ChatMessage } from "../api/chatbot.api";

interface Message {
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
}

// Floating chat bubble available on every page -- talks to the shared
// Gemini-powered /chatbot/message endpoint used by the mobile apps and
// the other web dashboards (Portal Web, Student Web).
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const handleAsk = async () => {
    if (!question.trim() || pending) return;
    const q = question;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setPending(true);
    try {
      const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.text }));
      const reply = await chatbotApi.sendMessage(q, history);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: msg, isError: true }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
      <Collapse in={open}>
        <Paper elevation={6} sx={{ width: 340, height: 460, display: "flex", flexDirection: "column", mb: 2, borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ bgcolor: "#12233a", color: "#fff", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography fontWeight={700} fontSize={15}>Chat Assistant</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#F3F4F6", px: 1.5, py: 0.75 }}>
            <InfoOutlinedIcon sx={{ fontSize: 14, color: "#6B7280" }} />
            <Typography fontSize={10.5} color="text.secondary">
              Don't share sensitive or confidential details — messages go to a third-party AI service.
            </Typography>
          </Box>
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
            {messages.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 4 }}>
                Ask general questions about using the platform.
              </Typography>
            )}
            {messages.map((m, i) => (
              <Box key={i} sx={{ mb: 1.5, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <Box
                  sx={{
                    maxWidth: "85%",
                    bgcolor: m.role === "user" ? "#12233a" : m.isError ? "#FEE2E2" : "#F3F4F6",
                    color: m.role === "user" ? "#fff" : m.isError ? "#DC2626" : "#111827",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    fontSize: 13,
                  }}
                >
                  {m.text}
                </Box>
              </Box>
            ))}
            {pending && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">Thinking...</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, p: 1.5, borderTop: "1px solid #E5E7EB" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              disabled={pending}
            />
            <IconButton color="primary" onClick={handleAsk} disabled={!question.trim() || pending}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
      {!open && (
        <Fab onClick={() => setOpen(true)} sx={{ bgcolor: "#12233a", color: "#fff", "&:hover": { bgcolor: "#1a3252" } }}>
          <ChatBubbleOutlineIcon />
        </Fab>
      )}
    </Box>
  );
}
