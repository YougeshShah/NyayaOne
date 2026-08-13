import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useInstitutionStudents, useAddInstitutionStudent, useUpdateInstitutionStudent, useRemoveInstitutionStudent } from "../../hooks/useInstitutionStudents";
import { useFirmUserActions } from "../../hooks/useFirmUsers";
import { AddStudentPayload, InstitutionStudent } from "../../api/institutionStudent.api";
import { liveClassInstitutionApi } from "../../api/liveClassInstitution.api";
import { PasswordField } from "../../components/common/PasswordField";

export function StudentsPage() {
  const { data: students, isLoading } = useInstitutionStudents();
  const addStudent = useAddInstitutionStudent();
  const { resetPassword } = useFirmUserActions();
  const updateStudent = useUpdateInstitutionStudent();
  const removeStudent = useRemoveInstitutionStudent();
  const [editingStudent, setEditingStudent] = useState<InstitutionStudent | null>(null);
  const editForm = useForm<{ fullName: string; phone?: string }>();

  const openEdit = (s: InstitutionStudent) => {
    setEditingStudent(s);
    editForm.reset({ fullName: s.fullName, phone: s.phone ?? "" });
  };

  const onEditSubmit = (values: { fullName: string; phone?: string }) => {
    if (!editingStudent) return;
    updateStudent.mutate({ id: editingStudent.id, payload: values }, { onSuccess: () => setEditingStudent(null) });
  };

  const handleRemove = (s: InstitutionStudent) => {
    if (window.confirm(`Remove ${s.fullName} from your institution? They will keep their own login but will no longer be listed here.`)) {
      removeStudent.mutate(s.id);
    }
  };
  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);
  const { register, handleSubmit, reset, formState, watch } = useForm<AddStudentPayload>();
  const selectedStudentCourseId = watch("interestedCourseId");

  const handleResetPassword = (id: string, name: string) => {
    resetPassword.mutate(id, {
      onSuccess: (data) => setResetResult({ name, password: data.newPassword }),
    });
  };

  const onSubmit = (values: AddStudentPayload) => {
    addStudent.mutate(values, {
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
          Students
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Student
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Students added here can log in to the Student app directly with the credentials you set below.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Added</TableCell>
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
            {students?.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => openEdit(s)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handleResetPassword(s.id, s.fullName)} disabled={resetPassword.isPending} sx={{ mr: 1 }}>
                    Reset Password
                  </Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => handleRemove(s)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {students?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No students added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Student</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {addStudent.isError && (
              <Alert severity="error">{(addStudent.error as any)?.response?.data?.message || "Failed to add student"}</Alert>
            )}
            <TextField select label="Course / Sector" required fullWidth defaultValue="" {...register("interestedCourseId", { required: true })} error={!!formState.errors.interestedCourseId}>
              {courses?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            {courses?.find((c) => c.id === selectedStudentCourseId)?.name?.toLowerCase().includes("loksewa") && (
              <TextField select label="Position Level (optional)" fullWidth defaultValue="" {...register("preferredExamType")}>
                <MenuItem value="">All levels</MenuItem>
                <MenuItem value="KHARIDAR">Kharidar (Non-Gazetted 3rd Class)</MenuItem>
                <MenuItem value="NAYAB_SUBBA">Nayab Subba (Non-Gazetted 1st Class)</MenuItem>
                <MenuItem value="SECTION_OFFICER">Section Officer / Sakha Adhikrit (Gazetted 3rd Class)</MenuItem>
              </TextField>
            )}
            <TextField label="Full Name" required fullWidth {...register("fullName", { required: true })} error={!!formState.errors.fullName} />
            <TextField label="Email" type="email" required fullWidth {...register("email", { required: true })} error={!!formState.errors.email} />
            <TextField label="Phone" fullWidth {...register("phone")} />
            <PasswordField
              label="Temporary Password"
              required
              fullWidth
              helperText="Minimum 8 characters — share this with the student"
              {...register("password", { required: true, minLength: 8 })}
              error={!!formState.errors.password}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={addStudent.isPending}>
              {addStudent.isPending ? "Adding..." : "Add Student"}
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
            Share this password with the student directly — it won't be shown again.
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

      <Dialog open={!!editingStudent} onClose={() => setEditingStudent(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit — {editingStudent?.fullName}</DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Full Name" required fullWidth {...editForm.register("fullName", { required: true })} />
            <TextField label="Phone" fullWidth {...editForm.register("phone")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditingStudent(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateStudent.isPending}>
              {updateStudent.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
