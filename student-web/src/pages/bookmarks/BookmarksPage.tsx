import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, IconButton, Chip, CircularProgress } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useBookmarks, useToggleBookmark } from "../../hooks/useBookmark";

export function BookmarksPage() {
  const navigate = useNavigate();
  const { data: bookmarks, isLoading } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        My Bookmarks
      </Typography>

      {isLoading && <CircularProgress size={24} />}

      {!isLoading && (bookmarks ?? []).length === 0 && (
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #E5E7EB", borderRadius: 3, textAlign: "center" }}>
          <BookmarkIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No bookmarks yet — tap the bookmark icon on any question while practicing to save it here.
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {bookmarks?.map((b) => (
          <Paper
            key={b.id}
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: b.courseId ? "pointer" : "default",
              "&:hover": b.courseId ? { borderColor: "#93C5FD" } : {},
            }}
            onClick={() => {
              if (b.courseId) navigate(`/courses/${b.courseId}`);
            }}
          >
            <Box>
              <Chip label={b.resourceType} size="small" variant="outlined" sx={{ mb: 0.5 }} />
              <Typography variant="body2">{b.preview}</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark.mutate({ resourceType: b.resourceType, resourceId: b.resourceId });
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
