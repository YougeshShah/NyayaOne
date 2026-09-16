import { useState } from "react";
import { Box, Button, TextField, Typography, Paper, List, ListItemButton, ListItemText, Chip, Divider } from "@mui/material";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useQuery } from "@tanstack/react-query";
import { precedentApi, PrecedentDetail } from "../../api/precedent.api";

export function DraftingPanelPage() {
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedPrecedent, setSelectedPrecedent] = useState<PrecedentDetail | null>(null);
  const [draftTitle, setDraftTitle] = useState("Untitled Draft");
  const [draftContent, setDraftContent] = useState("");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["precedent-search", activeSearch],
    queryFn: () => precedentApi.search({ search: activeSearch, limit: 15 }),
    enabled: !!activeSearch,
  });

  const openPrecedent = async (id: string) => {
    const detail = await precedentApi.getById(id);
    setSelectedPrecedent(detail);
  };

  const insertCitation = () => {
    if (!selectedPrecedent) return;
    const citation = `\n\n[${selectedPrecedent.title}${selectedPrecedent.caseNumber ? ` - ${selectedPrecedent.caseNumber}` : ""}${selectedPrecedent.decisionDate ? `, ${selectedPrecedent.decisionDate}` : ""}]\n`;
    setDraftContent((prev) => prev + citation);
  };

  const handleSave = () => {
    localStorage.setItem(`draft-${Date.now()}`, JSON.stringify({ title: draftTitle, content: draftContent }));
    alert("Draft saved locally in your browser.");
  };

  const handleDownload = () => {
    const blob = new Blob([draftContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.download = `${draftTitle || "draft"}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <Box sx={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Drafting Panel
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0 }}>
        {/* Left: Precedent search + preview */}
        <Paper elevation={0} sx={{ flex: "0 0 40%", border: "1px solid #E5E7EB", borderRadius: 2, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #E5E7EB" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search precedents (नजिर)..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setActiveSearch(searchText)}
            />
          </Box>

          {selectedPrecedent ? (
            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              <Button size="small" onClick={() => setSelectedPrecedent(null)} sx={{ mb: 1 }}>
                ← Back to results
              </Button>
              <Typography variant="subtitle1" fontWeight={700}>
                {selectedPrecedent.title}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", my: 1 }}>
                {selectedPrecedent.caseNumber && <Chip label={selectedPrecedent.caseNumber} size="small" />}
                {selectedPrecedent.decisionDate && <Chip label={selectedPrecedent.decisionDate} size="small" variant="outlined" />}
              </Box>
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={insertCitation} sx={{ mb: 2 }}>
                Insert Citation into Draft
              </Button>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedPrecedent.fullContent}
              </Typography>
            </Box>
          ) : (
            <List sx={{ flex: 1, overflow: "auto" }}>
              {isLoading && <Typography variant="body2" sx={{ p: 2 }}>Searching...</Typography>}
              {!isLoading && activeSearch && (searchResults?.items ?? []).length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No precedents found.
                </Typography>
              )}
              {(searchResults?.items ?? []).map((p) => (
                <ListItemButton key={p.id} onClick={() => openPrecedent(p.id)}>
                  <ListItemText
                    primary={p.title}
                    secondary={[p.caseNumber, p.decisionDate].filter(Boolean).join(" · ")}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>

        {/* Right: Draft editor */}
        <Paper elevation={0} sx={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 2, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #E5E7EB", display: "flex", gap: 1, alignItems: "center" }}>
            <TextField size="small" fullWidth value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
            <Button size="small" startIcon={<SaveIcon />} onClick={handleSave}>
              Save
            </Button>
            <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
              Download
            </Button>
          </Box>
          <TextField
            multiline
            fullWidth
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Start drafting your निवेदन, सम्झौता, or legal opinion here. Search precedents on the left and insert citations directly into your draft."
            sx={{
              flex: 1,
              "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start", p: 2 },
              "& textarea": { height: "100% !important" },
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
}
