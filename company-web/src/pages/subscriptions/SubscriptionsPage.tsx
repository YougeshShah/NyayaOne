import { useState } from "react";
import {
  Box,
  Button,
  Chip,
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
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm } from "react-hook-form";
import { usePlans, useSubscriptions, useSubscriptionActions } from "../../hooks/useSubscriptions";
import { useLawFirms } from "../../hooks/useLawFirms";
import { CreatePlanPayload } from "../../api/subscription.api";
import { SubscriptionStatus } from "../../types/subscription.types";

const STATUS_COLORS: Record<SubscriptionStatus, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  TRIAL: "warning",
  EXPIRED: "error",
  CANCELLED: "default",
};

function formatPrice(price: number | null) {
  if (price === null) return "Custom pricing";
  if (price === 0) return "Free";
  return `NPR ${price.toLocaleString()}/mo`;
}

function formatLimit(n: number | null) {
  return n === null ? "Unlimited" : n.toLocaleString();
}

export function SubscriptionsPage() {
  const { data: plans } = usePlans();
  const { data: subs } = useSubscriptions({ page: 1 });
  const { data: lawFirms } = useLawFirms({ page: 1, status: "ACTIVE" });
  const { createPlan, updatePlan, deletePlan, assignPlan, updateStatus } = useSubscriptionActions();
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const planForm = useForm<CreatePlanPayload>();
  const assignForm = useForm<{ lawFirmId: string; planId: string; status: SubscriptionStatus }>({
    defaultValues: { status: "ACTIVE" },
  });

  const onCreatePlan = (values: CreatePlanPayload) => {
    if (editingPlan) {
      updatePlan.mutate(
        { id: editingPlan.id, payload: values },
        {
          onSuccess: () => {
            planForm.reset();
            setEditingPlan(null);
            setPlanDialogOpen(false);
          },
        }
      );
      return;
    }
    createPlan.mutate(values, {
      onSuccess: () => {
        planForm.reset();
        setPlanDialogOpen(false);
      },
    });
  };

  const onAssign = (values: { lawFirmId: string; planId: string; status: SubscriptionStatus }) => {
    assignPlan.mutate(values, {
      onSuccess: () => {
        assignForm.reset();
        setAssignDialogOpen(false);
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Subscription Plans
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => setAssignDialogOpen(true)}>
            Assign Plan to Organization
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingPlan(null); planForm.reset({}); setPlanDialogOpen(true); }}>
            New Plan
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 1.5, mb: 3, bgcolor: "#FFF8E1", border: "1px solid #F0D98A", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Payment processing (eSewa/Khalti/bank) happens outside this system. Mark a subscription "Active" here only after payment is confirmed manually.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {plans?.map((p) => (
          <Grid item xs={12} sm={6} md={3} key={p.id}>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {p.name}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={700} sx={{ my: 0.5 }}>
                {formatPrice(p.priceMonthly)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                {p.description}
              </Typography>
              <Typography variant="caption" display="block">
                Members: {formatLimit(p.maxLawyers)}
              </Typography>
              <Typography variant="caption" display="block">
                Items: {formatLimit(p.maxCases)}
              </Typography>
              <Typography variant="caption" display="block">
                Storage: {p.maxStorageMb ? `${(p.maxStorageMb / 1000).toFixed(1)} GB` : "Unlimited"}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", mt: 1.5, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label={`${p._count?.subscriptions ?? 0} org(s)`}
                />
                {p.isActive === false && <Chip size="small" label="Inactive" color="default" variant="outlined" />}
              </Box>
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button size="small" onClick={() => { setEditingPlan(p); planForm.reset({ name: p.name, description: p.description ?? "", priceMonthly: p.priceMonthly ?? undefined, maxLawyers: p.maxLawyers ?? undefined, maxCases: p.maxCases ?? undefined, maxStorageMb: p.maxStorageMb ?? undefined }); setPlanDialogOpen(true); }}>
                  Edit
                </Button>
                <Button
                  size="small"
                  color={p.isActive === false ? "primary" : "error"}
                  onClick={() => updatePlan.mutate({ id: p.id, payload: { isActive: p.isActive === false } })}
                >
                  {p.isActive === false ? "Activate" : "Deactivate"}
                </Button>
                {p.isActive === false && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      if (window.confirm(`Permanently delete "${p.name}"? This cannot be undone.`)) {
                        deletePlan.mutate(p.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Organization Subscriptions
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subs?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No firm subscriptions yet
                </TableCell>
              </TableRow>
            )}
            {subs?.items.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.lawFirm.name}</TableCell>
                <TableCell>{s.plan.name}</TableCell>
                <TableCell>
                  <Chip size="small" label={s.status} color={STATUS_COLORS[s.status]} />
                </TableCell>
                <TableCell>{new Date(s.startedAt).toLocaleDateString()}</TableCell>
                <TableCell>{s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}</TableCell>
                <TableCell align="right">
                  {s.status !== "ACTIVE" && (
                    <Button size="small" onClick={() => updateStatus.mutate({ lawFirmId: s.lawFirmId, status: "ACTIVE" })}>
                      Mark Active
                    </Button>
                  )}
                  {s.status === "ACTIVE" && (
                    <Button size="small" color="error" onClick={() => updateStatus.mutate({ lawFirmId: s.lawFirmId, status: "CANCELLED" })}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={() => {
                      assignForm.reset({ lawFirmId: s.lawFirmId, planId: s.planId });
                      setAssignDialogOpen(true);
                    }}
                  >
                    Change Plan
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE/EDIT PLAN DIALOG */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingPlan ? "Edit Subscription Plan" : "New Subscription Plan"}</DialogTitle>
        <Box component="form" onSubmit={planForm.handleSubmit(onCreatePlan)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Plan Name" required fullWidth {...planForm.register("name", { required: true })} />
            <TextField label="Description" fullWidth {...planForm.register("description")} />
            <TextField
              label="Monthly Price (NPR — leave blank for custom/Enterprise pricing)"
              type="number"
              fullWidth
              {...planForm.register("priceMonthly")}
            />
            <TextField label="Max Members (blank = unlimited)" type="number" fullWidth {...planForm.register("maxLawyers")} />
            <TextField label="Max Items (Cases/Courses) (blank = unlimited)" type="number" fullWidth {...planForm.register("maxCases")} />
            <TextField select label="For Which Organization Type?" fullWidth defaultValue="" {...planForm.register("tenantType")}>
              <MenuItem value="">Both (Law Firm & Institution)</MenuItem>
              <MenuItem value="LAW_FIRM">Law Firm Only</MenuItem>
              <MenuItem value="EDUCATION">Institution Only</MenuItem>
            </TextField>
            <TextField select label="Billing Cycle" fullWidth defaultValue="1" {...planForm.register("durationMonths")}>
              <MenuItem value="1">Monthly</MenuItem>
              <MenuItem value="3">Every 3 Months</MenuItem>
              <MenuItem value="6">Every 6 Months</MenuItem>
              <MenuItem value="12">Yearly</MenuItem>
            </TextField>
            <TextField label="Max Storage MB (blank = unlimited)" type="number" fullWidth {...planForm.register("maxStorageMb")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createPlan.isPending}>
              {(createPlan.isPending || updatePlan.isPending) ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ASSIGN PLAN DIALOG */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Assign Plan to Organization</DialogTitle>
        <Box component="form" onSubmit={assignForm.handleSubmit(onAssign)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Organization" required fullWidth {...assignForm.register("lawFirmId", { required: true })}>
              {lawFirms?.items.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Plan" required fullWidth {...assignForm.register("planId", { required: true })}>
              {plans?.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} — {formatPrice(p.priceMonthly)}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Status" fullWidth defaultValue="ACTIVE" {...assignForm.register("status")}>
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={assignPlan.isPending}>
              {assignPlan.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
