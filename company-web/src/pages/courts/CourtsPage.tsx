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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import { useForm } from "react-hook-form";
import { useCourts, useCourtActions, useCourtProvinces, useCourtTypes } from "../../hooks/useCourts";
import { Court, CreateCourtPayload } from "../../types/court.types";

export function CourtsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [province, setProvince] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCourts({
    page: 1,
    limit: 200,
    province: province === "ALL" ? undefined : province,
    type: type === "ALL" ? undefined : type,
    search: search || undefined,
  });
  const { data: provinces } = useCourtProvinces();
  const { data: types } = useCourtTypes();
  const { create, update, deactivate, activate } = useCourtActions();

  const { register, handleSubmit, reset, formState } = useForm<CreateCourtPayload>();

  const openCreateDialog = () => {
    setEditingCourt(null);
    reset({ name: "", type: "", province: "", location: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (court: Court) => {
    setEditingCourt(court);
    reset({ name: court.name, type: court.type, province: court.province || "", location: court.location || "" });
    setDialogOpen(true);
  };

  const onSubmit = (values: CreateCourtPayload) => {
    if (editingCourt) {
      update.mutate({ id: editingCourt.id, payload: values }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(values, {
        onSuccess: () => {
          reset();
          setDialogOpen(false);
        },
      });
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Court Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} courts registered
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Court
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField select label="Province" size="small" value={province} onChange={(e) => setProvince(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="ALL">All Provinces</MenuItem>
          {provinces?.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        <TextField select label="Court Type" size="small" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="ALL">All Types</MenuItem>
          {types?.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search by name or location"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Court Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Province</TableCell>
              <TableCell>Location</TableCell>
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
                  No courts found for this filter
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((court) => (
              <TableRow key={court.id} hover>
                <TableCell>{court.name}</TableCell>
                <TableCell>
                  <Chip label={court.type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{court.province || "—"}</TableCell>
                <TableCell>{court.location || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={court.isActive ? "Active" : "Inactive"}
                    color={court.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEditDialog(court)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  {court.isActive ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => deactivate.mutate(court.id)}>
                      Deactivate
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => activate.mutate(court.id)}>
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
        <DialogTitle>{editingCourt ? "Edit Court" : "Add New Court"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Court Name"
              required
              fullWidth
              {...register("name", { required: true })}
              error={!!formState.errors.name}
            />
            <TextField
              label="Court Type"
              required
              placeholder="e.g. Supreme Court, District Court, Labour Court"
              fullWidth
              {...register("type", { required: true })}
              error={!!formState.errors.type}
            />
            <TextField
              label="Province (optional — leave blank for national-level courts)"
              placeholder="e.g. Bagmati, Koshi"
              fullWidth
              {...register("province")}
            />
            <TextField label="Location (optional)" fullWidth {...register("location")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? "Saving..." : editingCourt ? "Save Changes" : "Save Court"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
