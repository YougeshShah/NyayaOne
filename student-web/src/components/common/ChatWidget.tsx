import { useState, useRef, useEffect } from "react";
import { Box, Fab, Paper, TextField, IconButton, Typography, CircularProgress, Fade } from "@mui/material";
import ChatIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { chatbotApi, ChatMessage } from "../../api/chatbot.api";

export function ChatWidget() {
  const { courseId } = useParams<{ courseId?: string }>();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your study assistant. Ask me anything about your course material." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = useMutation({
    mutationFn: (msg: string) => chatbotApi.sendMessage(msg, messages, courseId),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    sendMessage.mutate(input, {
      onSuccess: (reply) => setMessages((prev) => [...prev, { role: "assistant", content: reply }]),
      onError: () =>
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]),
    });
  };

  return (
    <>
      <Fade in={open}>
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 340,
            height: 460,
            borderRadius: 3,
            display: open ? "flex" : "none",
            flexDirection: "column",
            zIndex: 1300,
            overflow: "hidden",
          }}
        >
          <Box sx={{ bgcolor: "primary.main", color: "#fff", p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Study Assistant
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  bgcolor: m.role === "user" ? "primary.main" : "#F1F5F9",
                  color: m.role === "user" ? "#fff" : "text.primary",
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  maxWidth: "85%",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {m.content}
                </Typography>
              </Box>
            ))}
            {sendMessage.isPending && (
              <Box sx={{ alignSelf: "flex-start", p: 1 }}>
                <CircularProgress size={16} />
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, p: 1, borderTop: "1px solid #E5E7EB" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <IconButton color="primary" onClick={handleSend} disabled={sendMessage.isPending}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      <Fab
        color="primary"
        onClick={() => setOpen((o) => !o)}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </>
  );
}
