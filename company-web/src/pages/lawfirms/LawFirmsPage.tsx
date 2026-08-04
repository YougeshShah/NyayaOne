import { useState } from "react";
import {
  Alert,
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
import { useLawFirms, useLawFirmActions } from "../../hooks/useLawFirms";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PasswordField } from "../../components/common/PasswordField";
import { LawFirmStatus } from "../../types/lawfirm.types";
import { CreateLawFirmPayload } from "../../api/lawfirm.api";

const STATUS_OPTIONS: (LawFirmStatus | "ALL")[] = ["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"];

export function LawFirmsPage() {
  const [status, setStatus] = useState<LawFirmStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useLawFirms({
    status: status === "ALL" ? undefined : status,
    search: search || undefined,
    page: 1,
  });

  const { approve, suspend, activate, reject, create } = useLawFirmActions();
  const { register, handleSubmit, reset, formState } = useForm<CreateLawFirmPayload>();

  const onCreate = (values: CreateLawFirmPayload) => {
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
        <Typography variant="h5" fontWeight={700}>
          Law Firm Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Law Firm
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          select
          label="Status"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value as LawFirmStatus | "ALL")}
          sx={{ minWidth: 180 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search by name or email"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Firm Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Users</TableCell>
              <TableCell align="center">Cases</TableCell>
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
                  No law firms found
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((firm) => (
              <TableRow key={firm.id} hover>
                <TableCell>{firm.name}</TableCell>
                <TableCell>{firm.email}</TableCell>
                <TableCell>
                  <StatusBadge status={firm.status} />
                </TableCell>
                <TableCell align="center">{firm.stats.totalUsers}</TableCell>
                <TableCell align="center">{firm.stats.totalCases}</TableCell>
                <TableCell align="right">
                  {firm.status === "PENDING" && (
                    <>
                      <Button size="small" variant="contained" onClick={() => approve.mutate(firm.id)} disabled={approve.isPending} sx={{ mr: 1 }}>
                        Approve
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => reject.mutate({ id: firm.id })} disabled={reject.isPending}>
                        Reject
                      </Button>
                    </>
                  )}
                  {firm.status === "ACTIVE" && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => suspend.mutate({ id: firm.id })}
                      disabled={suspend.isPending}
                    >
                      Suspend
                    </Button>
                  )}
                  {firm.status === "SUSPENDED" && (
                    <Button size="small" variant="contained" onClick={() => activate.mutate(firm.id)} disabled={activate.isPending}>
                      Reactivate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Law Firm</DialogTitle>
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
                  return respData?.message || "Failed to create law firm";
                })()}
              </Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              Firms added here go live immediately (ACTIVE) — no approval step needed, since Company is creating it directly.
            </Typography>
            <TextField label="Law Firm Name" required fullWidth {...register("lawFirmName", { required: true })} error={!!formState.errors.lawFirmName} />
            <TextField label="Law Firm Email" type="email" required fullWidth {...register("lawFirmEmail", { required: true })} error={!!formState.errors.lawFirmEmail} />
            <TextField label="Admin Full Name" required fullWidth {...register("adminFullName", { required: true })} error={!!formState.errors.adminFullName} />
            <TextField label="Admin Email" type="email" required fullWidth {...register("adminEmail", { required: true })} error={!!formState.errors.adminEmail} />
            <TextField label="Admin Phone" fullWidth {...register("adminPhone")} />
            <PasswordField
              label="Temporary Password"
              required
              fullWidth
              helperText="Minimum 8 characters — share this with the firm admin"
              {...register("password", { required: true, minLength: 8 })}
              error={!!formState.errors.password}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Law Firm"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
