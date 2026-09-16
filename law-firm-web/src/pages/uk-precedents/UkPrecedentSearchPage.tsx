import { useState } from "react";
import { Box, Button, TextField, Typography, Paper, List, ListItemButton, ListItemText, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ukPrecedentApi } from "../../api/ukPrecedent.api";

export function UkPrecedentSearchPage() {
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["uk-precedents", activeSearch, page],
    queryFn: () => ukPrecedentApi.search(activeSearch, page),
    enabled: !!activeSearch,
  });

  const runSearch = () => {
    setPage(1);
    setActiveSearch(searchText);
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        UK Case Law Search
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Live search of UK court judgments and tribunal decisions, sourced directly from the National Archives'
        Find Case Law service.
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search UK judgments (e.g. contract, negligence, breach of duty)..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
        />
        <Button variant="contained" onClick={runSearch}>
          Search
        </Button>
      </Box>

      {isLoading && <Typography variant="body2">Searching...</Typography>}
      {error && (
        <Typography variant="body2" color="error">
          Search failed. Please try again.
        </Typography>
      )}
      {!isLoading && activeSearch && (data?.items ?? []).length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No results found.
        </Typography>
      )}

      <List>
        {(data?.items ?? []).map((item, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 1 }}>
            <ListItemButton component="a" href={item.url} target="_blank" rel="noopener noreferrer" sx={{ p: 0 }}>
              <ListItemText
                primary={item.title}
                secondary={
                  <>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                      {item.citation && <Chip label={item.citation} size="small" />}
                      <Chip label={item.court} size="small" variant="outlined" />
                      <Chip label={new Date(item.publishedDate).toLocaleDateString()} size="small" variant="outlined" />
                    </Box>
                  </>
                }
              />
            </ListItemButton>
          </Paper>
        ))}
      </List>

      {data && data.items.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
          <Button size="small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="small" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
        Source: {data?.source || "UK National Archives - Find Case Law"} · Licensed under the Open Justice Licence
      </Typography>
    </Box>
  );
}
