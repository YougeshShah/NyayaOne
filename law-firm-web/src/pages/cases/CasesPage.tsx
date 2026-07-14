import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Autocomplete,
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
  Link,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import { useForm, Controller } from "react-hook-form";
import { useCases, useCreateCase, useUpdateCase } from "../../hooks/useCases";
import { useClients } from "../../hooks/useClients";
import { useFirmUsers } from "../../hooks/useFirmUsers";
import { useCourtsList } from "../../hooks/useCourtsList";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { CreateCasePayload, CaseStatus, CaseListItem } from "../../types/case.types";
import { UpdateCasePayload } from "../../api/case.api";

const STATUS_OPTIONS: (CaseStatus | "ALL")[] = ["ALL", "OPEN", "ONGOING", "ON_HOLD", "CLOSED", "DISMISSED"];
const STATUS_EDIT_OPTIONS: CaseStatus[] = ["OPEN", "ONGOING", "ON_HOLD", "CLOSED", "DISMISSED"];

export function CasesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseListItem | null>(null);
  const [status, setStatus] = useState<CaseStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCases({ status: status === "ALL" ? undefined : status, search: search || undefined, page: 1 });
  const { data: clients } = useClients({ page: 1 });
  const { data: lawyers } = useFirmUsers({ accountType: "LAWYER" });
  const { data: courts } = useCourtsList();
  const createCase = useCreateCase();
  const updateCase = useUpdateCase();

  const { register, handleSubmit, reset, control, formState } = useForm<CreateCasePayload>({
    defaultValues: { priority: "MEDIUM", clientIds: [], lawyerIds: [] },
  });

  const editForm = useForm<UpdateCasePayload>();

  const onCreate = (values: CreateCasePayload) => {
    createCase.mutate(values, {
      onSuccess: () => {
        reset();
        setCreateOpen(false);
      },
    });
  };

  const openEdit = (c: CaseListItem) => {
    setEditingCase(c);
    editForm.reset({
      status: c.status,
      priority: c.priority,
      remarks: "",
    });
  };

  const onEditSubmit = (values: UpdateCasePayload) => {
    if (!editingCase) return;
    updateCase.mutate({ id: editingCase.id, payload: values }, { onSuccess: () => setEditingCase(null) });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Cases
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} cases
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New Case
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField select label="Status" size="small" value={status} onChange={(e) => setStatus(e.target.value as CaseStatus | "ALL")} sx={{ minWidth: 160 }}>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Search by case number or title" size="small" fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Case No.</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Court</TableCell>
              <TableCell>Lead Lawyer</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Hearings</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No cases found
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/cases/${c.id}`} underline="hover" fontWeight={600}>
                    {c.caseNumber}
                  </Link>
                </TableCell>
                <TableCell>{c.caseTitle}</TableCell>
                <TableCell>{c.court.name}</TableCell>
                <TableCell>{c.lawyers.find((l) => l.isLead)?.lawyer.fullName || c.lawyers[0]?.lawyer.fullName || "—"}</TableCell>
                <TableCell>
                  <PriorityBadge priority={c.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell align="center">{c._count.hearings}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEdit(c)}>
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Create New Case</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Case Number" required fullWidth {...register("caseNumber", { required: true })} error={!!formState.errors.caseNumber} />
              <TextField select label="Priority" required fullWidth defaultValue="MEDIUM" {...register("priority", { required: true })} sx={{ minWidth: 160 }}>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </TextField>
            </Box>

            <TextField label="Case Title" required fullWidth {...register("caseTitle", { required: true })} error={!!formState.errors.caseTitle} />

            <Controller
              name="courtId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  options={[...(courts?.items ?? [])].sort((a, b) => {
                    const provA = a.province || "ZZZ National Level";
                    const provB = b.province || "ZZZ National Level";
                    if (provA !== provB) return provA.localeCompare(provB);
                    return a.name.localeCompare(b.name);
                  })}
                  groupBy={(o) => o.province || "National Level"}
                  getOptionLabel={(o) => `${o.name} (${o.type})`}
                  onChange={(_, val) => field.onChange(val?.id ?? "")}
                  renderInput={(params) => <TextField {...params} label="Court" required error={!!formState.errors.courtId} />}
                />
              )}
            />

            <Controller
              name="clientIds"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={clients?.items ?? []}
                  getOptionLabel={(o) => o.fullName}
                  onChange={(_, val) => field.onChange(val.map((v) => v.id))}
                  renderInput={(params) => <TextField {...params} label="Clients" required error={!!formState.errors.clientIds} />}
                />
              )}
            />

            <Controller
              name="lawyerIds"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={lawyers?.items ?? []}
                  getOptionLabel={(o) => o.fullName}
                  onChange={(_, val) => field.onChange(val.map((v) => v.id))}
                  renderInput={(params) => <TextField {...params} label="Assigned Lawyers" required error={!!formState.errors.lawyerIds} />}
                />
              )}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Opposing Party" fullWidth {...register("opposingParty")} />
              <TextField label="Opposing Lawyer" fullWidth {...register("opposingLawyer")} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Court Subject" fullWidth {...register("courtSubject")} />
              <TextField label="Category" fullWidth {...register("category")} />
            </Box>
            <TextField label="Judge" fullWidth {...register("judge")} />
            <TextField label="Remarks" fullWidth multiline rows={2} {...register("remarks")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createCase.isPending}>
              {createCase.isPending ? "Creating..." : "Create Case"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* EDIT / UPDATE STATUS DIALOG */}
      <Dialog open={!!editingCase} onClose={() => setEditingCase(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update Case — {editingCase?.caseNumber}</DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Status" fullWidth defaultValue={editingCase?.status} {...editForm.register("status")}>
              {STATUS_EDIT_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Priority" fullWidth defaultValue={editingCase?.priority} {...editForm.register("priority")}>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </TextField>
            <TextField label="Judge" fullWidth {...editForm.register("judge")} />
            <TextField label="Remarks (adds an update note)" fullWidth multiline rows={3} {...editForm.register("remarks")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditingCase(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateCase.isPending}>
              {updateCase.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
