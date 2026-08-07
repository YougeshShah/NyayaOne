import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { useForm, Controller } from "react-hook-form";
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
  const { register, handleSubmit, reset, control, formState } = useForm<CreateLawFirmPayload>({
    defaultValues: { tenantType: "LAW_FIRM", modulesEnabled: ["case_management"] },
  });

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
          Organization Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Organization
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
        <DialogTitle>Add Organization</DialogTitle>
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
            <TextField select label="Organization Type" required fullWidth defaultValue="LAW_FIRM" {...register("tenantType")}>
              <MenuItem value="LAW_FIRM">Law Firm</MenuItem>
              <MenuItem value="EDUCATION">Education / Coaching Institute</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
            <TextField label="Organization Name" required fullWidth {...register("lawFirmName", { required: true })} error={!!formState.errors.lawFirmName} />
            <TextField label="Organization Email" type="email" required fullWidth {...register("lawFirmEmail", { required: true })} error={!!formState.errors.lawFirmEmail} />
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

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Admin Dashboard Modules — controls what THIS organization's own admin panel shows
                (this does not affect individual students who register and subscribe directly — see note below)
              </Typography>
              <Controller
                name="modulesEnabled"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {[
                      { key: "case_management", label: "Case Management — cases, hearings, clients (Law Firm admin tools)" },
                      { key: "student_platform", label: "Student Management — add/manage this institute's own students, view their progress" },
                      { key: "live_classes", label: "Live Classes — schedule and host classes for this institute's students" },
                      { key: "document_templates", label: "Document Templates — generate legal documents" },
                    ].map((mod) => (
                      <FormControlLabel
                        key={mod.key}
                        control={
                          <Checkbox
                            checked={field.value?.includes(mod.key) ?? false}
                            onChange={(e) => {
                              const current = field.value ?? [];
                              field.onChange(
                                e.target.checked ? [...current, mod.key] : current.filter((k) => k !== mod.key)
                              );
                            }}
                          />
                        }
                        label={mod.label}
                      />
                    ))}
                  </Box>
                )}
              />
              <Typography variant="caption" sx={{ display: "block", mt: 1, fontStyle: "italic", color: "text.secondary" }}>
                Note: Individual students (Law, IELTS, IOE, Doctors, Loksewa — any subject) can always register
                and subscribe to a course directly through the Student app, with no organization involved.
                These modules only matter for institutes that want their own admin dashboard.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Organization"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
