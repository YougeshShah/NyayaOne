import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import { useLibraryResources } from "../../hooks/useLibrary";
import { getResourceFileUrl, LibraryResource } from "../../api/library.api";

const typeLabels: Record<string, string> = {
  NOTE: "Note",
  BOOK: "Book",
  CASE_SUMMARY: "Case Summary",
  ACT: "Act",
  REGULATION: "Regulation",
  ARTICLE: "Article",
};

// Splits the document's extracted text into segments so any part matching
// the current in-document search term can be rendered as a <mark> — and,
// unlike a plain highlight, actually scrolls to each match in turn so a
// student can "Find" their way through a long Act/Book/Note, not just see
// that a match exists somewhere off-screen.
function HighlightedContent({ text, term, activeMatchIndex }: { text: string; term: string; activeMatchIndex: number }) {
  const matchRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    matchRefs.current = [];
  }, [text, term]);

  useEffect(() => {
    matchRefs.current[activeMatchIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeMatchIndex, term]);

  if (!term.trim()) return <>{text}</>;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  let matchCounter = -1;
  return (
    <>
      {parts.map((part, i) => {
        if (part.toLowerCase() !== term.toLowerCase()) return part;
        matchCounter++;
        const isActive = matchCounter === activeMatchIndex;
        return (
          <mark
            key={i}
            ref={(el) => (matchRefs.current[matchCounter] = el)}
            style={{ backgroundColor: isActive ? "#FB923C" : "#FEF08A", padding: "0 1px" }}
          >
            {part}
          </mark>
        );
      })}
    </>
  );
}

function countMatches(text: string, term: string) {
  if (!term.trim()) return 0;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "gi")) ?? []).length;
}

export function LibraryPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [viewingResource, setViewingResource] = useState<LibraryResource | null>(null);
  const [viewerSearchTerm, setViewerSearchTerm] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  useEffect(() => {
    setActiveMatchIndex(0);
  }, [viewerSearchTerm, viewingResource]);

  const { data, isLoading } = useLibraryResources({ courseId: courseId as string, search: search || undefined });
  // Deep-link support: coming from a bookmark ("?resourceId=xyz") should
  // open that specific resource directly, not just land on the general list.
  useEffect(() => {
    const resourceId = searchParams.get("resourceId");
    if (resourceId && data) {
      const match = data.items?.find((r: LibraryResource) => r.id === resourceId);
      if (match) setViewingResource(match);
    }
  }, [searchParams, data]);

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
            {resource.content && (
              <IconButton
                size="small"
                onClick={() => {
                  setViewingResource(resource);
                  setViewerSearchTerm("");
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            )}
            {resource.fileUrl && resource.isDownloadable && (
              <IconButton component="a" href={getResourceFileUrl(resource.fileUrl)} target="_blank" rel="noopener" size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>
        ))}
      </Box>

      <Dialog open={!!viewingResource} onClose={() => setViewingResource(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {viewingResource?.title}
          <IconButton onClick={() => setViewingResource(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Find a word or phrase in this document..."
              value={viewerSearchTerm}
              onChange={(e) => setViewerSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            {viewerSearchTerm.trim() && viewingResource?.content && (
              <>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", px: 1 }}>
                  {countMatches(viewingResource.content, viewerSearchTerm) > 0
                    ? `${activeMatchIndex + 1} / ${countMatches(viewingResource.content, viewerSearchTerm)}`
                    : "0 / 0"}
                </Typography>
                <IconButton
                  size="small"
                  disabled={countMatches(viewingResource.content, viewerSearchTerm) === 0}
                  onClick={() =>
                    setActiveMatchIndex((i) => (i - 1 + countMatches(viewingResource!.content!, viewerSearchTerm)) % countMatches(viewingResource!.content!, viewerSearchTerm))
                  }
                >
                  <KeyboardArrowUpIcon />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={countMatches(viewingResource.content, viewerSearchTerm) === 0}
                  onClick={() => setActiveMatchIndex((i) => (i + 1) % countMatches(viewingResource!.content!, viewerSearchTerm))}
                >
                  <KeyboardArrowDownIcon />
                </IconButton>
              </>
            )}
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
            {viewingResource?.content ? (
              <HighlightedContent text={viewingResource.content} term={viewerSearchTerm} activeMatchIndex={activeMatchIndex} />
            ) : (
              "No text content available for this document."
            )}
          </Typography>
          {viewingResource?.fileUrl && viewingResource.isDownloadable && (
            <Button
              component="a"
              href={getResourceFileUrl(viewingResource.fileUrl)}
              target="_blank"
              rel="noopener"
              startIcon={<DownloadIcon />}
              sx={{ mt: 3 }}
            >
              Download Original File
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
