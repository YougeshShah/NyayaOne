import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "../../api/course.api";
import { courseContentApi } from "../../api/courseContent.api";

export function CourseContentAdminPage() {
  const [courseId, setCourseId] = useState("");
  const [term, setTerm] = useState("");
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState<"PDF" | "IMAGE" | "TEXT">("PDF");
  const [textBody, setTextBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState("");

  const { data: courses } = useQuery({ queryKey: ["courses"], queryFn: () => courseApi.list() });
  const selectedCourse = courses?.find((c) => c.id === courseId);

  const { data: contents } = useQuery({
    queryKey: ["course-content-admin", courseId],
    queryFn: () => courseContentApi.listForAdmin(courseId),
    enabled: !!courseId,
  });

  const queryClient = useQueryClient();
  const upload = useMutation({
    mutationFn: () =>
      courseContentApi.create(courseId, term, title, fileType, {
        subjectId: subjectId || undefined,
        textBody: fileType === "TEXT" ? textBody : undefined,
        file: file || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-content-admin", courseId] });
      setTerm("");
      setTitle("");
      setTextBody("");
      setFile(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => courseContentApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-content-admin", courseId] }),
  });

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Course Content
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload study material (PDF, image, or text) organized by term/batch. Only your own students will see
        content you upload here.
      </Typography>

      <TextField select label="Course" size="small" fullWidth value={courseId} onChange={(e) => setCourseId(e.target.value)} sx={{ mb: 3, maxWidth: 300 }}>
        {courses?.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {courseId && (
        <>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Term (e.g. Semester 1, Batch A)" size="small" fullWidth value={term} onChange={(e) => setTerm(e.target.value)} />
                <TextField select label="Type" size="small" sx={{ width: 140 }} value={fileType} onChange={(e) => setFileType(e.target.value as any)}>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="IMAGE">Image</MenuItem>
                  <MenuItem value="TEXT">Text</MenuItem>
                </TextField>
              </Box>
              {selectedCourse?.subjects && selectedCourse.subjects.length > 0 && (
                <TextField select label="Subject (optional)" size="small" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <MenuItem value="">None</MenuItem>
                  {selectedCourse.subjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField label="Title" size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
              {fileType === "TEXT" ? (
                <TextField label="Content" multiline rows={6} fullWidth value={textBody} onChange={(e) => setTextBody(e.target.value)} />
              ) : (
                <Button variant="outlined" component="label" size="small">
                  {file ? file.name : `Choose ${fileType === "PDF" ? "PDF" : "Image"} File`}
                  <input
                    type="file"
                    hidden
                    accept={fileType === "PDF" ? "application/pdf" : "image/*"}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
              )}
              <Button
                variant="contained"
                onClick={() => upload.mutate()}
                disabled={!term || !title || (fileType === "TEXT" ? !textBody : !file) || upload.isPending}
              >
                {upload.isPending ? "Uploading..." : "Add Content"}
              </Button>
            </Box>
          </Paper>

          {(contents ?? []).map((c) => (
            <Paper key={c.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {c.title} <Chip label={c.term} size="small" sx={{ ml: 1 }} />
                    {c.subject && <Chip label={c.subject.name} size="small" variant="outlined" sx={{ ml: 0.5 }} />}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.fileType} · Added {new Date(c.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => remove.mutate(c.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
}
