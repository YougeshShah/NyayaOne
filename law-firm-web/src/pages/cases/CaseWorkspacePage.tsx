import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caseTaskApi } from "../../api/caseTask.api";
import { caseNoteApi } from "../../api/caseNote.api";
import { caseDeadlineApi } from "../../api/caseDeadline.api";
import { userApi } from "../../api/user.api";

const STATUS_COLOR: Record<string, "default" | "info" | "success"> = {
  PENDING: "default",
  IN_PROGRESS: "info",
  DONE: "success",
};

export function CaseWorkspacePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [tab, setTab] = useState(0);
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const { data: tasks } = useQuery({
    queryKey: ["case-tasks", caseId],
    queryFn: () => caseTaskApi.listForCase(caseId as string),
    enabled: !!caseId && tab === 0,
  });
  const { data: staffList } = useQuery({
    queryKey: ["firm-staff-for-task"],
    queryFn: () => userApi.list({}),
    enabled: tab === 0,
  });
  const staffItems: any[] = (staffList as any)?.items ?? (Array.isArray(staffList) ? staffList : []);

  const filteredTasks = (tasks ?? []).filter((t) => statusFilter === "ALL" || t.status === statusFilter);

  const createTask = useMutation({
    mutationFn: () => caseTaskApi.create(caseId as string, taskTitle, taskAssignee, undefined, taskDueDate || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-tasks", caseId] });
      setTaskDialogOpen(false);
      setTaskTitle("");
      setTaskAssignee("");
      setTaskDueDate("");
    },
  });
  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "IN_PROGRESS" | "DONE" }) => caseTaskApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-tasks", caseId] }),
  });
  const deleteTask = useMutation({
    mutationFn: (id: string) => caseTaskApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-tasks", caseId] }),
  });

  const [newNote, setNewNote] = useState("");
  const { data: notes } = useQuery({
    queryKey: ["case-notes", caseId],
    queryFn: () => caseNoteApi.listForCase(caseId as string),
    enabled: !!caseId && tab === 1,
  });
  const createNote = useMutation({
    mutationFn: () => caseNoteApi.create(caseId as string, newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-notes", caseId] });
      setNewNote("");
    },
  });
  const deleteNote = useMutation({
    mutationFn: (id: string) => caseNoteApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-notes", caseId] }),
  });

  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDue, setDeadlineDue] = useState("");
  const [deadlineRemind, setDeadlineRemind] = useState("");
  const { data: deadlines } = useQuery({
    queryKey: ["case-deadlines", caseId],
    queryFn: () => caseDeadlineApi.listForCase(caseId as string),
    enabled: !!caseId && tab === 2,
  });
  const createDeadline = useMutation({
    mutationFn: () => caseDeadlineApi.create(caseId as string, deadlineTitle, deadlineDue, deadlineRemind),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-deadlines", caseId] });
      setDeadlineDialogOpen(false);
      setDeadlineTitle("");
      setDeadlineDue("");
      setDeadlineRemind("");
    },
  });
  const deleteDeadline = useMutation({
    mutationFn: (id: string) => caseDeadlineApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-deadlines", caseId] }),
  });

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Case Workspace
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Tasks" />
        <Tab label="Internal Notes" />
        <Tab label="Deadlines" />
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <TextField select size="small" label="Filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ width: 180 }}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTaskDialogOpen(true)}>
              Assign Task
            </Button>
          </Box>

          {filteredTasks.length === 0 && (
            <Typography variant="body2" color="text.secondary">No tasks match this filter.</Typography>
          )}
          {filteredTasks.map((t) => (
            <Paper key={t.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {t.title} <Chip label={t.status.replace("_", " ")} size="small" color={STATUS_COLOR[t.status]} sx={{ ml: 1 }} />
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Assigned to {t.assignee.fullName}
                    {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    value={t.status}
                    onChange={(e) => updateTaskStatus.mutate({ id: t.id, status: e.target.value as any })}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="DONE">Done</MenuItem>
                  </TextField>
                  <IconButton size="small" onClick={() => deleteTask.mutate(t.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}

          <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Assign Task</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <TextField label="Title" fullWidth value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
              <TextField select label="Assign To" fullWidth value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
                {staffItems.map((u: any) => (
                  <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>
                ))}
              </TextField>
              <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={() => createTask.mutate()} disabled={!taskTitle || !taskAssignee}>
                Assign
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {tab === 1 && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Confidential — only your firm's own team can see these, never the client.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <TextField size="small" fullWidth multiline minRows={2} placeholder="Add an internal note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
            <Button variant="contained" onClick={() => createNote.mutate()} disabled={!newNote.trim()}>
              Add
            </Button>
          </Box>
          {(notes ?? []).map((n) => (
            <Paper key={n.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2">{n.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {n.author.fullName} · {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => deleteNote.mutate(n.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </>
      )}

      {tab === 2 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDeadlineDialogOpen(true)}>
              Add Deadline
            </Button>
          </Box>
          {(deadlines ?? []).map((d) => (
            <Paper key={d.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body1" fontWeight={600}>{d.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Due {new Date(d.dueAt).toLocaleString()} · Reminder {d.sent ? "sent" : "pending"}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => deleteDeadline.mutate(d.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}

          <Dialog open={deadlineDialogOpen} onClose={() => setDeadlineDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Add Deadline / हदम्याद</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <TextField label="Title (e.g. हदम्याद - रिट निवेदन)" fullWidth value={deadlineTitle} onChange={(e) => setDeadlineTitle(e.target.value)} />
              <TextField label="Due Date/Time" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={deadlineDue} onChange={(e) => setDeadlineDue(e.target.value)} />
              <TextField label="Remind Me At" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={deadlineRemind} onChange={(e) => setDeadlineRemind(e.target.value)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeadlineDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={() => createDeadline.mutate()} disabled={!deadlineTitle || !deadlineDue || !deadlineRemind}>
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
