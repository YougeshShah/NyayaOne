import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Fab,
  Badge,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Collapse,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { useAuthStore } from "../store/authStore";
import { messagingApi, ConversationSummary, MessagingContact, MessageItem } from "../api/messaging.api";

const BRAND_COLOR = "#0F172A";
const POLL_INTERVAL_MS = 5000;

type View = "list" | "newChat" | "thread";

// Floating messaging widget -- real user-to-user chat (not AI). Replaces
// the AI chatbot widget's UI slot; the chatbot code itself stays in the
// codebase (untouched) but is no longer rendered here.
export function MessagingWidget() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [contacts, setContacts] = useState<MessagingContact[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUnread = useCallback(async () => {
    try {
      const count = await messagingApi.unreadCount();
      setUnreadTotal(count);
    } catch {
      // silent -- badge just won't update this cycle
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const list = await messagingApi.listConversations();
      setConversations(list);
    } catch {
      // silent -- keep showing the last known list
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { items } = await messagingApi.listMessages(conversationId);
      setMessages(items);
    } catch {
      // silent
    }
  }, []);

  // Badge polling -- always on regardless of whether the widget is open.
  useEffect(() => {
    refreshUnread();
    const id = setInterval(refreshUnread, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshUnread]);

  // Foreground polling for whichever view is open.
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!open) return;

    if (view === "list") {
      loadConversations();
      pollRef.current = setInterval(loadConversations, POLL_INTERVAL_MS);
    } else if (view === "thread" && activeConversation) {
      loadMessages(activeConversation.id);
      pollRef.current = setInterval(() => loadMessages(activeConversation.id), POLL_INTERVAL_MS);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, view, activeConversation, loadConversations, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const openWidget = () => {
    setOpen(true);
    setView("list");
  };

  const openNewChat = async () => {
    setView("newChat");
    setLoading(true);
    try {
      const list = await messagingApi.listContacts();
      setContacts(list);
    } finally {
      setLoading(false);
    }
  };

  const openThread = async (conversation: ConversationSummary) => {
    setActiveConversation(conversation);
    setView("thread");
    setMessages([]);
    setLoading(true);
    try {
      await loadMessages(conversation.id);
    } finally {
      setLoading(false);
    }
    refreshUnread();
  };

  const startChatWith = async (contact: MessagingContact) => {
    setLoading(true);
    try {
      const conversation = await messagingApi.startConversation(contact.id);
      await openThread({
        id: conversation.id,
        otherUser: contact,
        lastMessageText: null,
        lastMessageAt: null,
        unreadCount: 0,
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Couldn't start this conversation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || sending || !activeConversation) return;
    const text = messageText;
    setMessageText("");
    setSending(true);
    try {
      const sent = await messagingApi.sendMessage(activeConversation.id, text);
      setMessages((prev) => [...prev, sent]);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Message failed to send.");
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const backToList = () => {
    setView("list");
    setActiveConversation(null);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
      <Collapse in={open}>
        <Paper elevation={6} sx={{ width: 340, height: 460, display: "flex", flexDirection: "column", mb: 2, borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ bgcolor: BRAND_COLOR, color: "#fff", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              {view === "thread" && (
                <IconButton size="small" onClick={backToList} sx={{ color: "#fff" }}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
              <Typography fontWeight={700} fontSize={15} noWrap>
                {view === "thread" && activeConversation ? activeConversation.otherUser.fullName : view === "newChat" ? "New Message" : "Messages"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {view === "list" && (
                <IconButton size="small" onClick={openNewChat} sx={{ color: "#fff" }}>
                  <AddCommentIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {view === "list" && (
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {loading && conversations.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : conversations.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 4, px: 2 }}>
                  No conversations yet. Tap the + icon to message someone.
                </Typography>
              ) : (
                <List disablePadding>
                  {conversations.map((c) => (
                    <ListItemButton key={c.id} onClick={() => openThread(c)} sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar src={c.otherUser.avatarUrl ?? undefined}>{c.otherUser.fullName?.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={c.otherUser.fullName}
                        secondary={c.lastMessageText ?? "Start the conversation"}
                        primaryTypographyProps={{ fontSize: 14, fontWeight: c.unreadCount > 0 ? 700 : 500 }}
                        secondaryTypographyProps={{ fontSize: 12, noWrap: true }}
                      />
                      {c.unreadCount > 0 && (
                        <Badge badgeContent={c.unreadCount} color="error" sx={{ ml: 1 }} />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          )}

          {view === "newChat" && (
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : contacts.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 4, px: 2 }}>
                  No one available to message right now.
                </Typography>
              ) : (
                <List disablePadding>
                  {contacts.map((c) => (
                    <ListItemButton key={c.id} onClick={() => startChatWith(c)} sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar src={c.avatarUrl ?? undefined}>{c.fullName?.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={c.fullName}
                        secondary={c.accountType.replace(/_/g, " ")}
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: 11 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          )}

          {view === "thread" && (
            <>
              <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
                {loading && messages.length === 0 ? (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 4 }}>
                    Say hello 👋
                  </Typography>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === currentUserId;
                    return (
                      <Box key={m.id} sx={{ mb: 1.5, display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                        <Box
                          sx={{
                            maxWidth: "85%",
                            bgcolor: isMine ? BRAND_COLOR : "#F3F4F6",
                            color: isMine ? "#fff" : "#111827",
                            borderRadius: 2,
                            px: 1.5,
                            py: 1,
                            fontSize: 13,
                          }}
                        >
                          {m.content}
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1, p: 1.5, borderTop: "1px solid #E5E7EB" }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={sending}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!messageText.trim() || sending}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      </Collapse>
      {!open && (
        <Fab onClick={openWidget} sx={{ bgcolor: BRAND_COLOR, color: "#fff", "&:hover": { bgcolor: "#1e293b" } }}>
          <Badge badgeContent={unreadTotal} color="error">
            <ChatBubbleOutlineIcon />
          </Badge>
        </Fab>
      )}
    </Box>
  );
}
