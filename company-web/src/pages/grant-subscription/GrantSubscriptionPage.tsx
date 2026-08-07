import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useCoursesAdmin, useSearchStudents, useGrantSubscription } from "../../hooks/useCourseAdmin";
import { StudentSearchResult } from "../../api/courseAdmin.api";

export function GrantSubscriptionPage() {
  const { data: courses } = useCoursesAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: students, isFetching } = useSearchStudents(searchQuery);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [courseId, setCourseId] = useState("");
  const grantSubscription = useGrantSubscription();
  const [successMsg, setSuccessMsg] = useState("");

  const handleGrant = () => {
    if (!selectedStudent || !courseId) return;
    grantSubscription.mutate(
      { courseId, studentId: selectedStudent.id },
      {
        onSuccess: () => {
          setSuccessMsg(`Access granted to ${selectedStudent.fullName} for this course.`);
          setSelectedStudent(null);
          setSearchQuery("");
          setCourseId("");
        },
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Grant Course Subscription
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Demo mode — until a payment gateway is wired, use this after receiving payment manually (bank transfer,
        eSewa, cash) to activate a student's course access by hand.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>
            {successMsg}
          </Alert>
        )}
        {grantSubscription.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(grantSubscription.error as any)?.response?.data?.message || "Failed to grant subscription"}
          </Alert>
        )}

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          1. Find the student
        </Typography>
        <TextField
          placeholder="Search by name or email..."
          fullWidth
          size="small"
          value={selectedStudent ? selectedStudent.fullName : searchQuery}
          onChange={(e) => {
            setSelectedStudent(null);
            setSearchQuery(e.target.value);
          }}
          sx={{ mb: 1 }}
        />
        {isFetching && <CircularProgress size={18} />}
        {!selectedStudent && students && students.length > 0 && (
          <List dense sx={{ border: "1px solid #E5E7EB", borderRadius: 1, mb: 2 }}>
            {students.map((s) => (
              <ListItemButton key={s.id} onClick={() => setSelectedStudent(s)}>
                <ListItemText primary={s.fullName} secondary={s.email} />
              </ListItemButton>
            ))}
          </List>
        )}
        {selectedStudent && (
          <Alert severity="info" sx={{ mb: 2 }} onClose={() => setSelectedStudent(null)}>
            Selected: {selectedStudent.fullName} ({selectedStudent.email})
          </Alert>
        )}

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, mt: 2 }}>
          2. Choose the course
        </Typography>
        <TextField select fullWidth size="small" value={courseId} onChange={(e) => setCourseId(e.target.value)} sx={{ mb: 3 }}>
          <MenuItem value="">Select a course</MenuItem>
          {courses?.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!selectedStudent || !courseId || grantSubscription.isPending}
          onClick={handleGrant}
        >
          {grantSubscription.isPending ? "Granting..." : "Grant Access"}
        </Button>
      </Paper>
    </Box>
  );
}
