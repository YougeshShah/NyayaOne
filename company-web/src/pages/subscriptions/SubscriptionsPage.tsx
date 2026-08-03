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
  const { createPlan, assignPlan, updateStatus } = useSubscriptionActions();

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const planForm = useForm<CreatePlanPayload>();
  const assignForm = useForm<{ lawFirmId: string; planId: string; status: SubscriptionStatus }>({
    defaultValues: { status: "ACTIVE" },
  });

  const onCreatePlan = (values: CreatePlanPayload) => {
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
            Assign Plan to Firm
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPlanDialogOpen(true)}>
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
                Lawyers: {formatLimit(p.maxLawyers)}
              </Typography>
              <Typography variant="caption" display="block">
                Cases: {formatLimit(p.maxCases)}
              </Typography>
              <Typography variant="caption" display="block">
                Storage: {p.maxStorageMb ? `${(p.maxStorageMb / 1000).toFixed(1)} GB` : "Unlimited"}
              </Typography>
              <Chip
                size="small"
                label={`${p._count?.subscriptions ?? 0} firm(s)`}
                sx={{ mt: 1.5 }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Firm Subscriptions
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Law Firm</TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE PLAN DIALOG */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Subscription Plan</DialogTitle>
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
            <TextField label="Max Lawyers (blank = unlimited)" type="number" fullWidth {...planForm.register("maxLawyers")} />
            <TextField label="Max Cases (blank = unlimited)" type="number" fullWidth {...planForm.register("maxCases")} />
            <TextField label="Max Storage MB (blank = unlimited)" type="number" fullWidth {...planForm.register("maxStorageMb")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createPlan.isPending}>
              {createPlan.isPending ? "Saving..." : "Create Plan"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ASSIGN PLAN DIALOG */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Assign Plan to Firm</DialogTitle>
        <Box component="form" onSubmit={assignForm.handleSubmit(onAssign)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Law Firm" required fullWidth {...assignForm.register("lawFirmId", { required: true })}>
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
