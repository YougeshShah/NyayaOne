import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import { useLibraryResources } from "../../hooks/useLibrary";
import { getResourceFileUrl } from "../../api/library.api";

const typeLabels: Record<string, string> = {
  NOTE: "Note",
  BOOK: "Book",
  CASE_SUMMARY: "Case Summary",
  ACT: "Act",
  REGULATION: "Regulation",
  ARTICLE: "Article",
};

export function LibraryPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useLibraryResources({ courseId: courseId as string, search: search || undefined });

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <IconButton onClick={() => navigate(`/courses/${courseId}`)} size="small" sx={{ mb: 1 }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Library
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Notes, books, and reference material for this course.
      </Typography>

      <TextField
        fullWidth
        placeholder="Search resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && (data?.items ?? []).length === 0 && (
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #E5E7EB", borderRadius: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No resources here yet — check back soon, or subscribe to unlock more.
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {data?.items.map((resource) => (
          <Paper
            key={resource.id}
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: "#EFF6FF",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DescriptionIcon fontSize="small" />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Chip label={typeLabels[resource.type] ?? resource.type} size="small" variant="outlined" sx={{ mb: 0.5, height: 20, fontSize: 11 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                {resource.title}
              </Typography>
              {resource.content && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {resource.content}
                </Typography>
              )}
            </Box>
            {resource.fileUrl && resource.isDownloadable && (
              <IconButton component="a" href={getResourceFileUrl(resource.fileUrl)} target="_blank" rel="noopener" size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
