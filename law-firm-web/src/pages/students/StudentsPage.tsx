import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useInstitutionStudents, useAddInstitutionStudent } from "../../hooks/useInstitutionStudents";
import { AddStudentPayload } from "../../api/institutionStudent.api";
import { PasswordField } from "../../components/common/PasswordField";

export function StudentsPage() {
  const { data: students, isLoading } = useInstitutionStudents();
  const addStudent = useAddInstitutionStudent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<AddStudentPayload>();

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
              <TableCell align="right">Added</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {students?.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell align="right">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {students?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
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
    </Box>
  );
}
