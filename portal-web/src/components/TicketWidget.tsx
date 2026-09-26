import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Collapse,
  Chip,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useAuthStore } from "../store/authStore";
import { ticketApi, TicketSummary, TicketDetail, TicketStatus } from "../api/ticket.api";

const BRAND_COLOR = "#0F172A";
const POLL_INTERVAL_MS = 8000;

const STATUS_COLOR: Record<TicketStatus, "warning" | "info" | "success" | "default"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "default",
};

type View = "list" | "new" | "thread";

// Floating "Support" widget for opening/tracking tickets with TechnoOne
// (Company) -- async, not real-time chat. Only shown to a tenant admin
// (LAW_FIRM_ADMIN); everyone else renders nothing.
export function TicketWidget() {
  const accountType = useAuthStore((s) => s.user?.accountType);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketDetail | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      const { items } = await ticketApi.list();
      setTickets(items);
    } catch {
      // silent -- keep showing the last known list
    }
  }, []);

  const loadTicket = useCallback(async (id: string) => {
    try {
      const detail = await ticketApi.getById(id);
      setActiveTicket(detail);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!open) return;

    if (view === "list") {
      loadTickets();
      pollRef.current = setInterval(loadTickets, POLL_INTERVAL_MS);
    } else if (view === "thread" && activeTicket) {
      pollRef.current = setInterval(() => loadTicket(activeTicket.id), POLL_INTERVAL_MS);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, view, activeTicket?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeTicket?.comments]);

  if (accountType !== "LAW_FIRM_ADMIN") return null;

  const openWidget = () => {
    setOpen(true);
    setView("list");
  };

  const openThread = async (id: string) => {
    setView("thread");
    setActiveTicket(null);
    setLoading(true);
    try {
      await loadTicket(id);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newSubject.trim() || !newDescription.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await ticketApi.create(newSubject.trim(), newDescription.trim());
      setNewSubject("");
      setNewDescription("");
      await openThread(created.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Couldn't open the ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicket || submitting) return;
    const text = replyText;
    setReplyText("");
    setSubmitting(true);
    try {
      await ticketApi.addComment(activeTicket.id, text);
      await loadTicket(activeTicket.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Reply failed to send.");
      setReplyText(text);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!activeTicket) return;
    if (!confirm("Close this ticket?")) return;
    try {
      await ticketApi.updateStatus(activeTicket.id, "CLOSED");
      await loadTicket(activeTicket.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Couldn't close the ticket.");
    }
  };

  const backToList = () => {
    setView("list");
    setActiveTicket(null);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, left: 24, zIndex: 1300 }}>
      <Collapse in={open}>
        <Paper elevation={6} sx={{ width: 340, height: 460, display: "flex", flexDirection: "column", mb: 2, borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ bgcolor: BRAND_COLOR, color: "#fff", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              {view !== "list" && (
                <IconButton size="small" onClick={backToList} sx={{ color: "#fff" }}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
              <Typography fontWeight={700} fontSize={15} noWrap>
                {view === "thread" && activeTicket ? activeTicket.subject : view === "new" ? "New Ticket" : "Support"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {view === "list" && (
                <IconButton size="small" onClick={() => setView("new")} sx={{ color: "#fff" }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {view === "list" && (
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {loading && tickets.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : tickets.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 4, px: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                    No support tickets yet.
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setView("new")}>
                    Open a Ticket
                  </Button>
                </Box>
              ) : (
                <List disablePadding>
                  {tickets.map((t) => (
                    <ListItemButton key={t.id} onClick={() => openThread(t.id)} sx={{ py: 1 }}>
                      <ListItemText
                        primary={t.subject}
                        secondary={new Date(t.updatedAt).toLocaleString()}
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 600, noWrap: true }}
                        secondaryTypographyProps={{ fontSize: 11 }}
                      />
                      <Chip label={t.status.replace("_", " ")} size="small" color={STATUS_COLOR[t.status]} sx={{ ml: 1, fontSize: 10 }} />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          )}

          {view === "new" && (
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                size="small"
                label="Subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                disabled={submitting}
              />
              <TextField
                size="small"
                label="Describe the issue"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                multiline
                minRows={5}
                disabled={submitting}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: BRAND_COLOR, "&:hover": { bgcolor: "#1e293b" } }}
                onClick={handleCreate}
                disabled={!newSubject.trim() || !newDescription.trim() || submitting}
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </Box>
          )}

          {view === "thread" && (
            <>
              <Box sx={{ px: 1.5, pt: 1 }}>
                {activeTicket && (
                  <Chip label={activeTicket.status.replace("_", " ")} size="small" color={STATUS_COLOR[activeTicket.status]} />
                )}
              </Box>
              <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
                {loading || !activeTicket ? (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 1.5, display: "flex", justifyContent: "flex-end" }}>
                      <Box sx={{ maxWidth: "90%", bgcolor: BRAND_COLOR, color: "#fff", borderRadius: 2, px: 1.5, py: 1, fontSize: 13 }}>
                        {activeTicket.description}
                      </Box>
                    </Box>
                    {activeTicket.comments.map((c) => {
                      const isMine = c.authorId === currentUserId;
                      return (
                        <Box key={c.id} sx={{ mb: 1.5, display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: isMine ? "right" : "left", mb: 0.25 }}>
                              {isMine ? "You" : c.author.accountType === "COMPANY" ? "TechnoOne Support" : c.author.fullName}
                            </Typography>
                            <Box
                              sx={{
                                maxWidth: "90%",
                                bgcolor: isMine ? BRAND_COLOR : "#F3F4F6",
                                color: isMine ? "#fff" : "#111827",
                                borderRadius: 2,
                                px: 1.5,
                                py: 1,
                                fontSize: 13,
                              }}
                            >
                              {c.content}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </>
                )}
              </Box>
              {activeTicket && activeTicket.status !== "CLOSED" && (
                <Box sx={{ display: "flex", gap: 1, p: 1.5, borderTop: "1px solid #E5E7EB" }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    disabled={submitting}
                  />
                  <IconButton color="primary" onClick={handleReply} disabled={!replyText.trim() || submitting}>
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              {activeTicket && activeTicket.status !== "CLOSED" && (
                <Box sx={{ px: 1.5, pb: 1.5 }}>
                  <Button size="small" color="inherit" onClick={handleClose}>
                    Close Ticket
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Collapse>
      {!open && (
        <Fab onClick={openWidget} sx={{ bgcolor: BRAND_COLOR, color: "#fff", "&:hover": { bgcolor: "#1e293b" } }}>
          <SupportAgentIcon />
        </Fab>
      )}
    </Box>
  );
}
