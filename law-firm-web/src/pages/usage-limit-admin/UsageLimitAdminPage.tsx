import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, TextField, MenuItem, Paper, Button, Alert } from "@mui/material";
import { usageLimitApi } from "../../api/usageLimit.api";
import { liveClassInstitutionApi } from "../../api/liveClassInstitution.api";

export function UsageLimitAdminPage() {
  const [courseId, setCourseId] = useState("");
  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });
  const selectedCourse = courses?.find((c: any) => c.id === courseId);
  const isLanguageCourse = selectedCourse?.category === "LANGUAGE";
  const qc = useQueryClient();

  const { data: currentLimit } = useQuery({
    queryKey: ["usage-limit-institution", courseId],
    queryFn: () => usageLimitApi.getAsInstitution(courseId),
    enabled: !!courseId,
  });

  const [practiceLimit, setPracticeLimit] = useState<string>("");
  const [mockTestLimit, setMockTestLimit] = useState<string>("");
  const [speakingLimit, setSpeakingLimit] = useState<string>("");

  useEffect(() => {
    setPracticeLimit(currentLimit?.practiceLimit != null ? String(currentLimit.practiceLimit) : "");
    setMockTestLimit(currentLimit?.mockTestLimit != null ? String(currentLimit.mockTestLimit) : "");
    setSpeakingLimit(currentLimit?.speakingLimit != null ? String(currentLimit.speakingLimit) : "");
  }, [currentLimit]);

  const save = useMutation({
    mutationFn: () =>
      usageLimitApi.setAsInstitution({
        courseId,
        practiceLimit: practiceLimit === "" ? null : Number(practiceLimit),
        mockTestLimit: mockTestLimit === "" ? null : Number(mockTestLimit),
        speakingLimit: speakingLimit === "" ? null : Number(speakingLimit),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usage-limit-institution", courseId] }),
  });

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Usage Limits
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sets your own policy for your students on this course — overrides the platform default. Leave blank to use
        the platform default instead.
      </Typography>

      <TextField select label="Course" size="small" value={courseId} onChange={(e) => setCourseId(e.target.value)} sx={{ minWidth: 260, mb: 3 }}>
        <MenuItem value="">Select a course</MenuItem>
        {courses?.map((c: any) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {courseId && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3 }}>
          {save.isSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Saved.
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Practice limit (blank = use platform default)"
              type="number"
              fullWidth
              value={practiceLimit}
              onChange={(e) => setPracticeLimit(e.target.value)}
              helperText="How many times your students may open Practice for this course"
            />
            <TextField
              label="Mock Test limit (blank = use platform default)"
              type="number"
              fullWidth
              value={mockTestLimit}
              onChange={(e) => setMockTestLimit(e.target.value)}
              helperText="How many mock test attempts your students may take for this course"
            />
            {isLanguageCourse && (
              <TextField
                label="Speaking Test limit (blank = use platform default)"
                type="number"
                fullWidth
                value={speakingLimit}
                onChange={(e) => setSpeakingLimit(e.target.value)}
                helperText="How many speaking test recordings your students may submit for this course"
              />
            )}
            <Button variant="contained" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving..." : "Save Limits"}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
