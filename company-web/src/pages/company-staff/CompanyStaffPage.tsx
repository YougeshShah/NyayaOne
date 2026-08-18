import { useState } from "react";
import { PermissionOverrideDialog } from "../../components/permissions/PermissionOverrideDialog";
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
import { useCompanyStaff, useRoles, useCompanyStaffActions } from "../../hooks/useCompanyStaff";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PasswordField } from "../../components/common/PasswordField";
import { CreateCompanyStaffPayload, CompanyStaff } from "../../types/companyStaff.types";

export function CompanyStaffPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionUserId, setPermissionUserId] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<CompanyStaff | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);
  const { data, isLoading } = useCompanyStaff({ page: 1 });
  const { data: roles } = useRoles();
  const { create, updateStatus, update, resetPassword, updateRole } = useCompanyStaffActions();

  const { register, handleSubmit, reset, formState } = useForm<CreateCompanyStaffPayload>();
  const editForm = useForm<{ fullName: string; phone?: string }>();

  const onCreate = (values: CreateCompanyStaffPayload) => {
    create.mutate(values, {
      onSuccess: () => {
        reset();
        setDialogOpen(false);
      },
    });
  };

  const openEdit = (s: CompanyStaff) => {
    setEditingStaff(s);
    editForm.reset({ fullName: s.fullName, phone: s.phone ?? "" });
  };

  const onEditSubmit = (values: { fullName: string; phone?: string }) => {
    if (!editingStaff) return;
    update.mutate({ id: editingStaff.id, payload: values }, { onSuccess: () => setEditingStaff(null) });
  };

  const handleResetPassword = (id: string, name: string) => {
    resetPassword.mutate(id, {
      onSuccess: (data) => setResetResult({ name, password: data.newPassword }),
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Company Staff
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} Technocraftx team members
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Staff
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No company staff added yet
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    value={s.role?.id || ""}
                    onChange={(e) => updateRole.mutate({ id: s.id, roleId: e.target.value })}
                    sx={{ minWidth: 140 }}
                  >
                    {roles?.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell align="right">
                  {s.status === "ACTIVE" ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => updateStatus.mutate({ id: s.id, status: "SUSPENDED" })} sx={{ mr: 1 }}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => updateStatus.mutate({ id: s.id, status: "ACTIVE" })} sx={{ mr: 1 }}>
                      Activate
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={() => openEdit(s)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handleResetPassword(s.id, s.fullName)} disabled={resetPassword.isPending}>
                    Reset Password
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setPermissionUserId(s.id)} sx={{ ml: 1 }}>
                    Permissions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Company Staff</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {create.isError && (
              <Alert severity="error">
                {(() => {
                  const respData = (create.error as any)?.response?.data;
                  const fieldErrors = respData?.errors as { field: string; message: string }[] | undefined;
                  if (fieldErrors && fieldErrors.length > 0) {
                    return fieldErrors.map((e) => `${e.field}: ${e.message}`).join(" — ");
                  }
                  return respData?.message || "Failed to add staff member";
                })()}
              </Alert>
            )}
            <TextField label="Full Name" required fullWidth {...register("fullName", { required: true })} error={!!formState.errors.fullName} />
            <TextField label="Email" type="email" required fullWidth {...register("email", { required: true })} error={!!formState.errors.email} />
            <TextField label="Phone" fullWidth {...register("phone")} />
            <TextField select label="Role" required fullWidth {...register("roleId", { required: true })} error={!!formState.errors.roleId}>
              {roles?.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>
            <PasswordField
              label="Temporary Password"
              required
              fullWidth
              helperText="Minimum 8 characters"
              {...register("password", { required: true, minLength: 8 })}
              error={!!formState.errors.password}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Saving..." : "Add Staff"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!editingStaff} onClose={() => setEditingStaff(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Staff — {editingStaff?.fullName}</DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Full Name" required fullWidth {...editForm.register("fullName", { required: true })} />
            <TextField label="Phone" fullWidth {...editForm.register("phone")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditingStaff(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={update.isPending}>
              {update.isPending ? "Saving..." : "Save Changes"}
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
            Share this password with them directly — it won't be shown again.
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
      <PermissionOverrideDialog userId={permissionUserId} onClose={() => setPermissionUserId(null)} />
    </Box>
  );
}
