import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import { userAdminApi, SearchedUser } from "../../api/userAdmin.api";

const tenantLabel: Record<string, string> = {
  LAW_FIRM: "Law Firm",
  EDUCATION: "Institution",
};

export function UserAdminPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[] | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);

  const { data: pendingRequests } = useQuery({
    queryKey: ["password-reset-requests"],
    queryFn: () => userAdminApi.listPendingRequests(),
  });

  const resolveRequest = useMutation({
    mutationFn: (id: string) => userAdminApi.resolveRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["password-reset-requests"] }),
  });

  const search = useMutation({
    mutationFn: (q: string) => userAdminApi.search(q),
    onSuccess: (data) => setResults(data),
  });

  const resetPassword = useMutation({
    mutationFn: (id: string) => userAdminApi.resetPassword(id),
  });

  const updateContact = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { fullName?: string; email?: string; phone?: string } }) =>
      userAdminApi.updateContact(id, payload),
    onSuccess: (updated) => {
      setResults((prev) => prev?.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)) ?? null);
      setEditingUser(null);
    },
  });
  const [editingUser, setEditingUser] = useState<SearchedUser | null>(null);
  const editForm = useForm<{ fullName: string; email: string; phone?: string }>();

  const openEdit = (user: SearchedUser) => {
    setEditingUser(user);
    editForm.reset({ fullName: user.fullName, email: user.email, phone: user.phone ?? "" });
  };

  const onEditSubmit = (values: { fullName: string; email: string; phone?: string }) => {
    if (!editingUser) return;
    updateContact.mutate({ id: editingUser.id, payload: values });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) search.mutate(query.trim());
  };

  const handleReset = (user: SearchedUser) => {
    resetPassword.mutate(user.id, {
      onSuccess: (data) => setResetResult({ name: user.fullName, password: data.newPassword }),
    });
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        User Password Reset
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Search across every organization — Law Firm staff, Institution staff, students, clients — and reset any
        of their passwords directly.
      </Typography>

      {pendingRequests && pendingRequests.length > 0 && (
        <Paper elevation={0} sx={{ border: "1px solid #FDE68A", bgcolor: "#FFFBEB", borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Pending Reset Requests ({pendingRequests.length})
          </Typography>
          {pendingRequests.map((r) => (
            <Box key={r.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1, borderTop: "1px solid #FDE68A" }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {r.email}
                </Typography>
                {r.note && (
                  <Typography variant="caption" color="text.secondary">
                    {r.note}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setQuery(r.email);
                    search.mutate(r.email);
                  }}
                >
                  Find &amp; Reset
                </Button>
                <Button size="small" onClick={() => resolveRequest.mutate(r.id)} disabled={resolveRequest.isPending}>
                  Mark Resolved
                </Button>
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={search.isPending}>
          Search
        </Button>
      </Box>

      {search.isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {results && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.accountType.replace(/_/g, " ")} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {u.lawFirm ? `${u.lawFirm.name} (${tenantLabel[u.lawFirm.tenantType] ?? u.lawFirm.tenantType})` : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => openEdit(u)} sx={{ mr: 1 }}>
                      Edit Contact
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => handleReset(u)} disabled={resetPassword.isPending}>
                      Reset Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!resetResult} onClose={() => setResetResult(null)} fullWidth maxWidth="xs">
        <DialogTitle>Password Reset</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            New password generated for <strong>{resetResult?.name}</strong>.
          </Alert>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            No email service is configured yet — share this password with them directly. It won't be shown
            again.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#F3F4F6",
              borderRadius: 1,
              px: 2,
              py: 1.5,
              fontFamily: "monospace",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {resetResult?.password}
            <IconButton size="small" onClick={() => resetResult && navigator.clipboard.writeText(resetResult.password)} sx={{ ml: "auto" }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" onClick={() => setResetResult(null)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editingUser} onClose={() => setEditingUser(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Contact — {editingUser?.fullName}</DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {updateContact.isError && (
              <Alert severity="error">{(updateContact.error as any)?.response?.data?.message || "Failed to update"}</Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              Use this if the user's Gmail account or phone number has changed, or their name was entered
              incorrectly. Verify their identity first (support conversation, ID, etc.) before making changes.
            </Typography>
            <TextField label="Full Name" required fullWidth {...editForm.register("fullName", { required: true })} />
            <TextField label="Email (this is also their login)" type="email" required fullWidth {...editForm.register("email", { required: true })} />
            <TextField label="Phone" fullWidth {...editForm.register("phone")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateContact.isPending}>
              {updateContact.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
