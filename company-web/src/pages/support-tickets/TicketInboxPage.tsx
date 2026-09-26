import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { ticketApi, TicketSummary, TicketDetail, TicketStatus } from "../../api/ticket.api";
import { useAuthStore } from "../../store/authStore";
import { getStaticBaseUrl } from "../../api/profile.api";

const POLL_INTERVAL_MS = 10000;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

const STATUS_COLOR: Record<TicketStatus, "warning" | "info" | "success" | "default"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "default",
};

const FILTERS: Array<{ label: string; value: TicketStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

function attachmentUrlFor(path: string) {
  return `${getStaticBaseUrl()}/uploads/${path}`;
}

function AttachmentPreview({ url, type }: { url: string; type?: string | null }) {
  const isImage = type?.startsWith("image/");
  return isImage ? (
    <a href={attachmentUrlFor(url)} target="_blank" rel="noreferrer">
      <img src={attachmentUrlFor(url)} alt="attachment" style={{ maxWidth: 220, maxHeight: 180, borderRadius: 8, display: "block", marginBottom: 6 }} />
    </a>
  ) : (
    <Chip
      component="a"
      href={attachmentUrlFor(url)}
      target="_blank"
      clickable
      icon={<InsertDriveFileIcon fontSize="small" />}
      label="File attachment"
      size="small"
      sx={{ mb: 0.5 }}
    />
  );
}

// Company-side inbox for support tickets opened by institution/law firm
// admins. Async, page-refresh-on-interval -- not real-time chat.
export function TicketInboxPage() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  const loadTickets = useCallback(async (status: TicketStatus | "ALL") => {
    try {
      const { items } = await ticketApi.list(status === "ALL" ? undefined : status);
      setTickets(items);
    } catch {
      // silent -- keep last known list
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const d = await ticketApi.getById(id);
      setDetail(d);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    setLoadingList(true);
    loadTickets(filter).finally(() => setLoadingList(false));
    const id = setInterval(() => loadTickets(filter), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [filter, loadTickets]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingDetail(true);
    loadDetail(selectedId).finally(() => setLoadingDetail(false));
    const id = setInterval(() => loadDetail(selectedId), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [detail?.comments]);

  const pickReplyFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      alert("File is too large. Maximum size is 8MB.");
      return;
    }
    setReplyFile(file);
  };

  const handleReply = async () => {
    if ((!replyText.trim() && !replyFile) || !selectedId || submitting) return;
    const text = replyText;
    const file = replyFile;
    setReplyText("");
    setReplyFile(null);
    setSubmitting(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentType: string | undefined;
      if (file) {
        const uploaded = await ticketApi.uploadAttachment(file);
        attachmentUrl = uploaded.attachmentUrl;
        attachmentType = uploaded.attachmentType;
      }
      await ticketApi.addComment(selectedId, text, attachmentUrl, attachmentType);
      await loadDetail(selectedId);
      await loadTickets(filter);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Reply failed to send.");
      setReplyText(text);
      setReplyFile(file);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedId) return;
    try {
      await ticketApi.updateStatus(selectedId, status);
      await loadDetail(selectedId);
      await loadTickets(filter);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Couldn't update status.");
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Support Tickets
      </Typography>

      <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 2 }}>
        {FILTERS.map((f) => (
          <Tab key={f.value} label={f.label} value={f.value} />
        ))}
      </Tabs>

      <Grid container spacing={2} sx={{ height: "calc(100vh - 220px)" }}>
        <Grid item xs={12} md={4} sx={{ height: "100%" }}>
          <Paper variant="outlined" sx={{ height: "100%", overflowY: "auto" }}>
            {loadingList && tickets.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : tickets.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
                No tickets in this filter.
              </Typography>
            ) : (
              <List disablePadding>
                {tickets.map((t) => (
                  <ListItemButton key={t.id} selected={t.id === selectedId} onClick={() => setSelectedId(t.id)} sx={{ py: 1.5, alignItems: "flex-start" }}>
                    <ListItemText
                      primary={t.subject}
                      secondary={
                        <>
                          {t.lawFirm.name} · {t.createdBy.fullName}
                          <br />
                          {new Date(t.updatedAt).toLocaleString()}
                        </>
                      }
                      primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                    <Chip label={t.status.replace("_", " ")} size="small" color={STATUS_COLOR[t.status]} sx={{ ml: 1, mt: 0.5 }} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} sx={{ height: "100%" }}>
          <Paper variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {!selectedId ? (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Select a ticket to view details.
                </Typography>
              </Box>
            ) : loadingDetail || !detail ? (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Box sx={{ p: 2, borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography fontWeight={700}>{detail.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {detail.lawFirm.name} · opened by {detail.createdBy.fullName}
                    </Typography>
                  </Box>
                  <Select
                    size="small"
                    value={detail.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  >
                    {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).map((s) => (
                      <MenuItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      {detail.createdBy.fullName} (opened this ticket)
                    </Typography>
                    {detail.attachmentUrl && <AttachmentPreview url={detail.attachmentUrl} type={detail.attachmentType} />}
                    {detail.description && (
                      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#F9FAFB", display: "inline-block", maxWidth: "85%" }}>
                        <Typography fontSize={14}>{detail.description}</Typography>
                      </Paper>
                    )}
                  </Box>

                  {detail.comments.map((c) => {
                    const isMine = c.authorId === currentUserId;
                    return (
                      <Box key={c.id} sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                          {isMine ? "You" : c.author.accountType === "COMPANY" ? "TechnoOne Support" : c.author.fullName}
                        </Typography>
                        {c.attachmentUrl && <AttachmentPreview url={c.attachmentUrl} type={c.attachmentType} />}
                        {c.content && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              maxWidth: "85%",
                              bgcolor: isMine ? "#0F172A" : "#F3F4F6",
                              color: isMine ? "#fff" : "#111827",
                            }}
                          >
                            <Typography fontSize={14}>{c.content}</Typography>
                          </Paper>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {detail.status !== "CLOSED" && (
                  <>
                    {replyFile && (
                      <Box sx={{ px: 2, pt: 1 }}>
                        <Chip icon={<InsertDriveFileIcon fontSize="small" />} label={replyFile.name} size="small" onDelete={() => setReplyFile(null)} />
                      </Box>
                    )}
                    <Box sx={{ display: "flex", gap: 1, p: 2, borderTop: "1px solid #E5E7EB", alignItems: "center" }}>
                      <input
                        ref={replyFileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        hidden
                        onChange={(e) => {
                          pickReplyFile(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                      <IconButton onClick={() => replyFileInputRef.current?.click()} disabled={submitting}>
                        <AttachFileIcon />
                      </IconButton>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleReply()}
                        disabled={submitting}
                      />
                      <IconButton color="primary" onClick={handleReply} disabled={(!replyText.trim() && !replyFile) || submitting}>
                        {submitting ? <CircularProgress size={20} /> : <SendIcon />}
                      </IconButton>
                    </Box>
                  </>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
