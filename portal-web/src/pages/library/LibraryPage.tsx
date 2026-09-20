import { useState, useRef, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLibraryResources, useDownloadLibraryResource } from "../../hooks/useLibrary";
import { useTranslation } from "../../i18n/LanguageContext";
import { getGroupedTypeOptions, getLibraryTypeLabel } from "../../i18n/libraryTaxonomy";
import { LibraryResource } from "../../types/library.types";

// Highlights every occurrence of the current in-document search term and
// scrolls to whichever one is "active" — a plain highlight without
// jump-to-match still leaves a lawyer scanning a long Act manually to find
// where the match actually is.
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
  const { t, language } = useTranslation();
  const groupedTypeOptions = getGroupedTypeOptions(language);
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [viewingResource, setViewingResource] = useState<LibraryResource | null>(null);
  const [viewerSearchTerm, setViewerSearchTerm] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  useEffect(() => {
    setActiveMatchIndex(0);
  }, [viewerSearchTerm, viewingResource]);

  const { data, isLoading } = useLibraryResources({
    type: type === "ALL" ? undefined : (type as any),
    search: search || undefined,
    page: 1,
  });
  const downloadResource = useDownloadLibraryResource();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        {t("legalLibrary")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("libraryIntro")}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder={t("searchLibraryPlaceholder")}
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <Autocomplete
          size="small"
          sx={{ minWidth: 260 }}
          options={["ALL", ...groupedTypeOptions.map((o) => o.type)]}
          groupBy={(opt) => (opt === "ALL" ? "" : groupedTypeOptions.find((o) => o.type === opt)?.group || "")}
          getOptionLabel={(opt) => (opt === "ALL" ? t("allTypes") : getLibraryTypeLabel(opt as any, language))}
          value={type}
          onChange={(_, val) => setType(val || "ALL")}
          disableClearable
          renderInput={(params) => <TextField {...params} label={t("type")} />}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("title")}</TableCell>
              <TableCell>{t("type")}</TableCell>
              <TableCell>{t("category")}</TableCell>
              <TableCell align="center">{t("status")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t("noResourcesFound")}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Chip size="small" label={getLibraryTypeLabel(r.type, language)} variant="outlined" />
                </TableCell>
                <TableCell>{r.category || "—"}</TableCell>
                <TableCell align="center">
                  {r.isRepealed ? <Chip size="small" label={t("repealed")} color="error" /> : <Chip size="small" label={t("active")} color="success" />}
                </TableCell>
                <TableCell align="right">
                  {r.content && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setViewingResource(r);
                        setViewerSearchTerm("");
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}
                  {r.fileUrl && r.isDownloadable && (
                    <IconButton size="small" onClick={() => downloadResource.mutate({ id: r.id, title: r.title })}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
              "No text content available."
            )}
          </Typography>
          {viewingResource?.fileUrl && viewingResource.isDownloadable && (
            <Button
              startIcon={<DownloadIcon />}
              sx={{ mt: 3 }}
              onClick={() => downloadResource.mutate({ id: viewingResource.id, title: viewingResource.title })}
            >
              Download Original File
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
