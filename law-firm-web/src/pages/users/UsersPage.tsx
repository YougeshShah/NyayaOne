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
import { useFirmUsers, useFirmUserActions } from "../../hooks/useFirmUsers";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PasswordField } from "../../components/common/PasswordField";
import { CreateFirmUserPayload } from "../../types/user.types";

export function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useFirmUsers({});
  const { create, updateStatus } = useFirmUserActions();

  const { register, handleSubmit, reset, watch, formState } = useForm<CreateFirmUserPayload>({
    defaultValues: { accountType: "LAWYER" },
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
            Lawyers & Staff
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} team members
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Lawyer / Staff
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Bar No.</TableCell>
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
                <TableCell>{u.barRegistrationNo || "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={u.status} />
                </TableCell>
                <TableCell align="right">
                  {u.status === "ACTIVE" ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => updateStatus.mutate({ id: u.id, status: "SUSPENDED" })}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => updateStatus.mutate({ id: u.id, status: "ACTIVE" })}>
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
        <DialogTitle>Add Lawyer / Staff</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Role" required fullWidth defaultValue="LAWYER" {...register("accountType", { required: true })}>
              <MenuItem value="LAWYER">Lawyer</MenuItem>
              <MenuItem value="STAFF">Staff (Receptionist / Assistant / Intern)</MenuItem>
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
    </Box>
  );
}
