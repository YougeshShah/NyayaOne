import { useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import { useLibraryResources, useDownloadLibraryResource } from "../../hooks/useLibrary";
import { useTranslation } from "../../i18n/LanguageContext";
import { getGroupedTypeOptions, getLibraryTypeLabel } from "../../i18n/libraryTaxonomy";

export function LibraryPage() {
  const { t, language } = useTranslation();
  const groupedTypeOptions = getGroupedTypeOptions(language);
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");

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
    </Box>
  );
}
