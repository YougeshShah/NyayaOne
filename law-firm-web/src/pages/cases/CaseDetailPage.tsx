import { useRef, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Grid,
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
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useCaseDetail } from "../../hooks/useCases";
import { useCaseDocuments, useUploadDocument, useDeleteDocument, useDownloadDocument } from "../../hooks/useDocuments";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { DocumentCategory } from "../../types/document.types";

const CATEGORY_OPTIONS: DocumentCategory[] = [
  "CASE_FILING",
  "EVIDENCE",
  "COURT_ORDER",
  "AGREEMENT",
  "CORRESPONDENCE",
  "IDENTIFICATION",
  "OTHER",
];

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: caseData, isLoading } = useCaseDetail(id);
  const { data: documents } = useCaseDocuments(id);
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument(id);
  const downloadDoc = useDownloadDocument();

  const [category, setCategory] = useState<DocumentCategory>("OTHER");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      uploadDoc.mutate({ file, caseId: id, category });
    }
    e.target.value = "";
  };

  if (isLoading || !caseData) {
    return <Typography>Loading case...</Typography>;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/cases" underline="hover" color="inherit">
          Cases
        </Link>
        <Typography color="text.primary">{caseData.caseNumber}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {caseData.caseTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {caseData.caseNumber} — {caseData.court.name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <PriorityBadge priority={caseData.priority} />
          <StatusBadge status={caseData.status} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* CASE INFO */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Case Information
            </Typography>
            <InfoRow label="Court" value={`${caseData.court.name} (${caseData.court.type})`} />
            <InfoRow label="Judge" value={caseData.judge || "—"} />
            <InfoRow label="Opposing Party" value={caseData.opposingParty || "—"} />
            <InfoRow label="Opposing Lawyer" value={caseData.opposingLawyer || "—"} />
            <InfoRow label="Court Subject" value={caseData.courtSubject || "—"} />
            <InfoRow label="Category" value={caseData.category || "—"} />
            <InfoRow
              label="Clients"
              value={caseData.clients.map((c) => c.client.fullName).join(", ") || "—"}
            />
            <InfoRow
              label="Lawyers"
              value={caseData.lawyers.map((l) => `${l.lawyer.fullName}${l.isLead ? " (Lead)" : ""}`).join(", ") || "—"}
            />
            {caseData.remarks && <InfoRow label="Remarks" value={caseData.remarks} />}
          </Paper>
        </Grid>

        {/* HEARINGS TIMELINE */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Hearing History
            </Typography>
            {caseData.hearings.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No hearings scheduled yet.
              </Typography>
            )}
            {caseData.hearings.map((h) => (
              <Box key={h.id} sx={{ display: "flex", justifyContent: "space-between", py: 1.2, borderBottom: "1px solid #f0f0f0" }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(h.hearingDate).toLocaleString()}
                  </Typography>
                  {h.judge && (
                    <Typography variant="caption" color="text.secondary">
                      Judge: {h.judge}
                    </Typography>
                  )}
                </Box>
                <StatusBadge status={h.status} />
              </Box>
            ))}
          </Paper>

          {/* DOCUMENTS */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Documents
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  select
                  size="small"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  sx={{ minWidth: 160 }}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadDoc.isPending}
                >
                  {uploadDoc.isPending ? "Uploading..." : "Upload"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={handleFileSelected}
                />
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!documents || documents.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No documents uploaded yet
                      </TableCell>
                    </TableRow>
                  )}
                  {documents?.items.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>{doc.fileName}</TableCell>
                      <TableCell>
                        <Chip size="small" label={doc.category.replace(/_/g, " ")} variant="outlined" />
                      </TableCell>
                      <TableCell>{doc.uploadedBy.fullName}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => downloadDoc.mutate({ id: doc.id, fileName: doc.fileName })}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteDoc.mutate(doc.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", py: 0.8, borderBottom: "1px solid #f5f5f5" }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
