import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useForm } from "react-hook-form";
import { useCompanyStaff, useRoles, useCompanyStaffActions } from "../../hooks/useCompanyStaff";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PasswordField } from "../../components/common/PasswordField";
import { CreateCompanyStaffPayload } from "../../types/companyStaff.types";

export function CompanyStaffPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useCompanyStaff({ page: 1 });
  const { data: roles } = useRoles();
  const { create, updateStatus, updateRole } = useCompanyStaffActions();

  const { register, handleSubmit, reset, formState } = useForm<CreateCompanyStaffPayload>();

  const onCreate = (values: CreateCompanyStaffPayload) => {
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
            Company Staff
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} TrailBlaze Tech team members
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
                    <Button size="small" color="error" variant="outlined" onClick={() => updateStatus.mutate({ id: s.id, status: "SUSPENDED" })}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => updateStatus.mutate({ id: s.id, status: "ACTIVE" })}>
                      Activate
                    </Button>
                  )}
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
    </Box>
  );
}
