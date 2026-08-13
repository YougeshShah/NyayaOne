import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, Chip, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import { useFlashcards, useSubmitFamiliarity } from "../../hooks/useFlashcards";

export function FlashcardStudyPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: cards, isLoading } = useFlashcards(courseId as string);
  const submitFamiliarity = useSubmitFamiliarity();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Box sx={{ maxWidth: 600 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #E5E7EB", borderRadius: 3 }}>
          <Typography color="text.secondary">No flashcards available for this course yet.</Typography>
        </Paper>
      </Box>
    );
  }

  const card = cards[index % cards.length];

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };

  const handleRate = (familiarity: "AGAIN" | "GOOD" | "EASY") => {
    submitFamiliarity.mutate({ id: card.id, familiarity });
    goNext();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="body2" color="text.secondary">
          {index + 1} / {cards.length}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        onClick={() => setFlipped((f) => !f)}
        sx={{
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          textAlign: "center",
          border: "1px solid #E5E7EB",
          borderRadius: 4,
          cursor: "pointer",
          bgcolor: flipped ? "#F0FDF4" : "#fff",
          transition: "background-color 0.2s ease",
        }}
      >
        <Chip label={card.difficulty} size="small" variant="outlined" sx={{ mb: 3 }} />
        {!flipped ? (
          <>
            <Typography variant="h4" fontWeight={700}>
              {card.term}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 3 }}>
              Tap to reveal
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {card.definition}
            </Typography>
            {card.example && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {card.example}
              </Typography>
            )}
          </>
        )}
      </Paper>

      {flipped && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button fullWidth variant="outlined" color="error" onClick={() => handleRate("AGAIN")}>
            Again
          </Button>
          <Button fullWidth variant="outlined" color="warning" onClick={() => handleRate("GOOD")}>
            Good
          </Button>
          <Button fullWidth variant="outlined" color="success" onClick={() => handleRate("EASY")}>
            Easy
          </Button>
        </Box>
      )}

      {!flipped && (
        <Button fullWidth variant="text" onClick={goNext} sx={{ mt: 2 }}>
          Skip
        </Button>
      )}
    </Box>
  );
}
