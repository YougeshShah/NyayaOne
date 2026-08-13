import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
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
import { LawFirmStatus, LawFirmListItem } from "../../types/lawfirm.types";
import { CreateLawFirmPayload } from "../../api/lawfirm.api";
import { courseApi, subjectApi } from "../../api/courseAdmin.api";

const STATUS_OPTIONS: (LawFirmStatus | "ALL")[] = ["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"];

export function LawFirmsPage() {
  const [status, setStatus] = useState<LawFirmStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editModulesFirm, setEditModulesFirm] = useState<LawFirmListItem | null>(null);

  const { data, isLoading } = useLawFirms({
    status: status === "ALL" ? undefined : status,
    search: search || undefined,
    page: 1,
  });

  const { approve, suspend, activate, reject, create, updateModules, remove } = useLawFirmActions();

  const handleDelete = (firm: { id: string; name: string; stats: { totalUsers: number; totalCases: number } }) => {
    const warning =
      `Permanently delete "${firm.name}"?\n\n` +
      `This will delete ${firm.stats.totalUsers} staff account(s), ${firm.stats.totalCases} case(s), and all its ` +
      `question bank / mock test content. Students keep their own login but lose access to this organization's content.\n\n` +
      `This CANNOT be undone. Type the organization name to confirm.`;
    const typed = window.prompt(warning);
    if (typed === firm.name) {
      remove.mutate(firm.id);
    } else if (typed !== null) {
      window.alert("Name didn't match — deletion cancelled.");
    }
  };
  const { register, handleSubmit, reset, control, watch, setValue, formState } = useForm<CreateLawFirmPayload>({
    defaultValues: { tenantType: "LAW_FIRM", modulesEnabled: ["case_management"] },
  });
  const watchedModules = watch("modulesEnabled");
  const watchedTenantType = watch("tenantType");
  const { data: createCourses } = useQuery({ queryKey: ["all-courses"], queryFn: () => courseApi.list() });

  // Switching Organization Type should switch the sensible default module too —
  // otherwise picking "Education" while "Case Management" stays checked (the
  // Law Firm default) means Sector Access never appears unless the admin
  // notices and manually fixes the checkboxes themselves.
  useEffect(() => {
    if (watchedTenantType === "EDUCATION") {
      setValue("modulesEnabled", ["student_platform"]);
    } else if (watchedTenantType === "LAW_FIRM") {
      setValue("modulesEnabled", ["case_management"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedTenantType]);

  const { data: createSubjectsPreview } = useQuery({ queryKey: ["all-subjects-preview"], queryFn: () => subjectApi.list() });

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
              <TableCell>Sector Access</TableCell>
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
                <TableCell>
                  {firm.allowedCourseIds && firm.allowedCourseIds.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {firm.allowedCourseIds.map((id) => {
                        const course = createCourses?.find((c: any) => c.id === id);
                        return course ? <Chip key={id} label={course.name.replace(" Preparation", "").replace(" Entrance", "")} size="small" /> : null;
                      })}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {firm.modulesEnabled?.includes("student_platform") || firm.modulesEnabled?.includes("live_classes")
                        ? "All courses (unrestricted)"
                        : "—"}
                    </Typography>
                  )}
                </TableCell>
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
                    <Button size="small" variant="contained" onClick={() => activate.mutate(firm.id)} disabled={activate.isPending} sx={{ mr: 1 }}>
                      Reactivate
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={() => setEditModulesFirm(firm)} sx={{ mr: 1 }}>
                    Edit Modules
                  </Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(firm)} disabled={remove.isPending}>
                    Delete
                  </Button>
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

            {(watchedModules?.includes("student_platform") || watchedModules?.includes("live_classes")) && (
              <Box sx={{ pt: 1, borderTop: "1px solid #e5e7eb" }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Sector Access
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Which course(s) this institute is allowed to teach — leave none checked to allow every course
                  (not recommended for a single-sector institute).
                </Typography>
                <Controller
                  name="allowedCourseIds"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {createCourses?.map((c: any) => {
                        const courseSubjects = createSubjectsPreview?.filter((s: any) => s.courseId === c.id) ?? [];
                        return (
                          <Box key={c.id} sx={{ mb: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value?.includes(c.id) ?? false}
                                  onChange={(e) => {
                                    const current = field.value ?? [];
                                    field.onChange(e.target.checked ? [...current, c.id] : current.filter((id: string) => id !== c.id));
                                  }}
                                />
                              }
                              label={c.name}
                            />
                            {courseSubjects.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", ml: 4, mt: -0.5 }}>
                                Unlocks: {courseSubjects.map((s: any) => s.name).join(", ")}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Organization"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {editModulesFirm && (
        <EditModulesDialog
          firm={editModulesFirm}
          onClose={() => setEditModulesFirm(null)}
          onSave={(modulesEnabled, allowedCourseIds, allowedExamTypes) =>
            updateModules.mutate(
              { id: editModulesFirm.id, modulesEnabled, allowedCourseIds, allowedExamTypes } as any,
              { onSuccess: () => setEditModulesFirm(null) }
            )
          }
          saving={updateModules.isPending}
        />
      )}
    </Box>
  );
}

const MODULE_OPTIONS = [
  { key: "case_management", label: "Case Management — cases, hearings, clients (Law Firm admin tools)" },
  { key: "student_platform", label: "Student Management — add/manage this institute's own students, view their progress" },
  { key: "live_classes", label: "Live Classes — schedule and host classes for this institute's students" },
  { key: "document_templates", label: "Document Templates — generate legal documents" },
];

function EditModulesDialog({
  firm,
  onClose,
  onSave,
  saving,
}: {
  firm: LawFirmListItem;
  onClose: () => void;
  onSave: (modulesEnabled: string[], allowedCourseIds: string[], allowedExamTypes: string[]) => void;
  saving: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(firm.modulesEnabled ?? ["case_management"]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(firm.allowedCourseIds ?? []);
  const [selectedExamTypes, setSelectedExamTypes] = useState<string[]>((firm as any).allowedExamTypes ?? []);
  const { data: courses } = useQuery({ queryKey: ["all-courses"], queryFn: () => courseApi.list() });
  const { data: allSubjects } = useQuery({ queryKey: ["all-subjects-preview"], queryFn: () => subjectApi.list() });
  const showCourseAccess = selected.includes("student_platform") || selected.includes("live_classes");

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Modules — {firm.name}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          Controls what this organization's own admin dashboard shows. Changing this here updates it
          immediately — no need to recreate the organization.
        </Typography>
        {MODULE_OPTIONS.map((mod) => (
          <FormControlLabel
            key={mod.key}
            control={
              <Checkbox
                checked={selected.includes(mod.key)}
                onChange={(e) =>
                  setSelected((prev) => (e.target.checked ? [...prev, mod.key] : prev.filter((k) => k !== mod.key)))
                }
              />
            }
            label={mod.label}
          />
        ))}

        {showCourseAccess && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e5e7eb" }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Sector Access
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Which course(s) this institute is allowed to teach — students, questions, notes, and live classes
              they create will only ever apply to these. Leave none checked to allow every course (not
              recommended for a single-sector institute).
            </Typography>
            {courses?.map((c: any) => {
              const courseSubjects = allSubjects?.filter((s: any) => s.courseId === c.id) ?? [];
              return (
                <Box key={c.id} sx={{ mb: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCourses.includes(c.id)}
                        onChange={(e) =>
                          setSelectedCourses((prev) => (e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)))
                        }
                      />
                    }
                    label={c.name}
                  />
                  {courseSubjects.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", ml: 4, mt: -0.5 }}>
                      Unlocks: {courseSubjects.map((s: any) => s.name).join(", ")}
                    </Typography>
                  )}
                </Box>
              );
            })}

            {selectedCourses.some((id) => courses?.find((c: any) => c.id === id)?.name?.toLowerCase().includes("loksewa")) && (
              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e5e7eb" }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Loksewa Position Level Access
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Which level(s) this institute coaches for — leave none checked to allow all levels.
                </Typography>
                {[
                  { key: "KHARIDAR", label: "Kharidar (Non-Gazetted 3rd Class)" },
                  { key: "NAYAB_SUBBA", label: "Nayab Subba (Non-Gazetted 1st Class)" },
                  { key: "SECTION_OFFICER", label: "Section Officer / Sakha Adhikrit (Gazetted 3rd Class)" },
                ].map((level) => (
                  <FormControlLabel
                    key={level.key}
                    control={
                      <Checkbox
                        checked={selectedExamTypes.includes(level.key)}
                        onChange={(e) =>
                          setSelectedExamTypes((prev) => (e.target.checked ? [...prev, level.key] : prev.filter((k) => k !== level.key)))
                        }
                      />
                    }
                    label={level.label}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving || selected.length === 0}
          onClick={() => onSave(selected, selectedCourses, selectedExamTypes)}
        >
          {saving ? "Saving..." : "Save Modules"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
