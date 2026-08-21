import { useState } from "react";
import { PermissionOverrideDialog } from "../../components/permissions/PermissionOverrideDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantRoleApi } from "../../api/tenantRole.api";
import { useAuthStore } from "../../store/authStore";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
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
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import { useForm } from "react-hook-form";
import { useFirmUsers, useFirmUserActions } from "../../hooks/useFirmUsers";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PasswordField } from "../../components/common/PasswordField";
import { CreateFirmUserPayload, FirmUser } from "../../types/user.types";
import { passwordResetRequestApi } from "../../api/passwordResetRequest.api";

export function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const isEducation = user?.tenantType === "EDUCATION";
  const staffLabel = isEducation ? "Staff" : "Lawyer / Staff";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionUserId, setPermissionUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useFirmUsers({ search: search || undefined });
  const { create, updateStatus, resetPassword, update } = useFirmUserActions();
  const [editingUser, setEditingUser] = useState<FirmUser | null>(null);
  const editForm = useForm<{ fullName: string; phone?: string; barRegistrationNo?: string; specialization?: string }>();

  const openEdit = (u: FirmUser) => {
    setEditingUser(u);
    editForm.reset({
      fullName: u.fullName,
      phone: u.phone ?? "",
      barRegistrationNo: u.barRegistrationNo ?? "",
      specialization: u.specialization ?? "",
    });
  };

  const onEditSubmit = (values: { fullName: string; phone?: string; barRegistrationNo?: string; specialization?: string }) => {
    if (!editingUser) return;
    update.mutate({ id: editingUser.id, payload: values }, { onSuccess: () => setEditingUser(null) });
  };
  const qc = useQueryClient();
  const { data: tenantRoles } = useQuery({
    queryKey: ["tenant-roles"],
    queryFn: () => tenantRoleApi.listRoles(),
  });
  const { data: pendingRequests } = useQuery({
    queryKey: ["password-reset-requests"],
    queryFn: () => passwordResetRequestApi.listPending(),
  });
  const resolveRequest = useMutation({
    mutationFn: (id: string) => passwordResetRequestApi.resolve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["password-reset-requests"] }),
  });
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);

  const handleResetPassword = (id: string, name: string) => {
    resetPassword.mutate(id, {
      onSuccess: (data) => setResetResult({ name, password: data.newPassword }),
    });
  };

  const { register, handleSubmit, reset, watch, formState } = useForm<CreateFirmUserPayload>({
    defaultValues: { accountType: isEducation ? "STAFF" : "LAWYER" },
  });
  const accountType = watch("accountType");

  const onCreate = (values: CreateFirmUserPayload) => {
    create.mutate(values, {
      onSuccess: () => {
        reset();
        setDialogOpen(false);
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {isEducation ? "Staff" : "Lawyers & Staff"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} team members
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add {staffLabel}
        </Button>
      </Box>
      <TextField
        label="Search by name or email"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, maxWidth: 400 }}
      />

      {pendingRequests && pendingRequests.length > 0 && (
        <Paper elevation={0} sx={{ border: "1px solid #FDE68A", bgcolor: "#FFFBEB", borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Pending Password Reset Requests ({pendingRequests.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Someone forgot their password — find them in the table below (or Students page) and use "Reset
            Password", then mark the request resolved.
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
              <Button size="small" onClick={() => resolveRequest.mutate(r.id)} disabled={resolveRequest.isPending}>
                Mark Resolved
              </Button>
            </Box>
          ))}
        </Paper>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Role</TableCell>
              {!isEducation && <TableCell>Bar No.</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No lawyers or staff added yet
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.accountType}</TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    value={(u as any).roleId || ""}
                    onChange={(e) => update.mutate({ id: u.id, payload: { roleId: e.target.value || null } as any })}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="">— None —</MenuItem>
                    {tenantRoles?.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                {!isEducation && <TableCell>{u.barRegistrationNo || "—"}</TableCell>}
                <TableCell>
                  <StatusBadge status={u.status} />
                </TableCell>
                <TableCell align="right">
                  {u.status === "ACTIVE" ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => updateStatus.mutate({ id: u.id, status: "SUSPENDED" })} sx={{ mr: 1 }}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => updateStatus.mutate({ id: u.id, status: "ACTIVE" })} sx={{ mr: 1 }}>
                      Activate
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={() => openEdit(u)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handleResetPassword(u.id, u.fullName)} disabled={resetPassword.isPending}>
                    Reset Password
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setPermissionUserId(u.id)} sx={{ ml: 1 }}>
                    Permissions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add {staffLabel}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Role" required fullWidth defaultValue={isEducation ? "STAFF" : "LAWYER"} {...register("accountType", { required: true })}>
              {!isEducation && <MenuItem value="LAWYER">Lawyer</MenuItem>}
              <MenuItem value="STAFF">{isEducation ? "Staff (Teacher / Coordinator / Admin)" : "Staff (Receptionist / Assistant / Intern)"}</MenuItem>
            </TextField>
            <TextField select label="Assign Role (optional)" fullWidth defaultValue="" {...register("roleId")}>
              <MenuItem value="">— None —</MenuItem>
              {tenantRoles?.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Full Name" required fullWidth {...register("fullName", { required: true })} error={!!formState.errors.fullName} />
            <TextField label="Email" type="email" required fullWidth {...register("email", { required: true })} error={!!formState.errors.email} />
            <TextField label="Phone" fullWidth {...register("phone")} />
            <PasswordField
              label="Temporary Password"
              required
              fullWidth
              helperText={formState.errors.password ? "Minimum 8 characters" : "Share this with them securely — they can change it after first login"}
              {...register("password", { required: true, minLength: 8 })}
              error={!!formState.errors.password}
            />
            {accountType === "LAWYER" && (
              <>
                <TextField label="Bar Registration No." fullWidth {...register("barRegistrationNo")} />
                <TextField label="Specialization" fullWidth {...register("specialization")} />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Saving..." : "Add"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!resetResult} onClose={() => setResetResult(null)} fullWidth maxWidth="xs">
        <DialogTitle>Password Reset</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            New password generated for <strong>{resetResult?.name}</strong>.
          </Alert>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            There's no email service configured yet — share this password with them directly (phone, in person,
            etc). It won't be shown again.
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
        <DialogTitle>Edit — {editingUser?.fullName}</DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Full Name" required fullWidth {...editForm.register("fullName", { required: true })} />
            <TextField label="Phone" fullWidth {...editForm.register("phone")} />
            {editingUser?.accountType === "LAWYER" && (
              <>
                <TextField label="Bar Registration No." fullWidth {...editForm.register("barRegistrationNo")} />
                <TextField label="Specialization" fullWidth {...editForm.register("specialization")} />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={update.isPending}>
              {update.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <PermissionOverrideDialog userId={permissionUserId} onClose={() => setPermissionUserId(null)} />
    </Box>
  );
}
