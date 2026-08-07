import { useState } from "react";
import { Box, IconButton, Typography, TextField, Button, Collapse } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useSubmitFeedback } from "../../hooks/useFeedback";

interface RatingWidgetProps {
  targetType: "LIVE_CLASS" | "MOCK_TEST" | "COURSE";
  targetId: string;
  label?: string;
}

export function RatingWidget({ targetType, targetId, label = "Rate this" }: RatingWidgetProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitFeedback = useSubmitFeedback();

  const handleSelectStar = (value: number) => setRating(value);

  const handleSubmit = () => {
    if (rating === 0) return;
    submitFeedback.mutate(
      { targetType, targetId, rating, comment: comment || undefined },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  if (submitted) {
    return (
      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
        Thanks for your feedback! 🙏
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex" }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <IconButton
            key={value}
            size="small"
            onClick={() => handleSelectStar(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
          >
            {(hoverRating || rating) >= value ? (
              <StarIcon sx={{ color: "#F59E0B" }} />
            ) : (
              <StarBorderIcon sx={{ color: "#D1D5DB" }} />
            )}
          </IconButton>
        ))}
      </Box>
      <Collapse in={rating > 0}>
        <TextField
          placeholder="Add a comment (optional)"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 1, mb: 1 }}
        />
        <Button size="small" variant="contained" onClick={handleSubmit} disabled={submitFeedback.isPending}>
          {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
        </Button>
      </Collapse>
    </Box>
  );
}
