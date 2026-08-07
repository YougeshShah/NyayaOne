import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  IconButton,
  CircularProgress,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorderOutlined";
import { useMcqList, useCheckAnswer } from "../../hooks/useCourse";
import { useBookmarks, useToggleBookmark } from "../../hooks/useBookmark";

type OptionKey = "A" | "B" | "C" | "D";

export function McqPracticePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const navigate = useNavigate();

  const { data, isLoading } = useMcqList({ courseId, subjectId });
  const checkAnswer = useCheckAnswer();
  const { data: bookmarks } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctOption: string; explanation: string | null } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const questions = data?.items ?? [];
  const question = questions[index];

  const handleSelect = (option: OptionKey) => {
    if (!question || feedback) return; // lock in the answer once revealed
    setSelected(option);
    checkAnswer.mutate(
      { id: question.id, selectedOption: option },
      {
        onSuccess: (result) => {
          setFeedback(result);
          if (result.isCorrect) setCorrectCount((c) => c + 1);
        },
      }
    );
  };

  const handleNext = () => {
    setSelected(null);
    setFeedback(null);
    setIndex((i) => i + 1);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h6" fontWeight={700}>
          No questions here yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          This subject doesn't have practice questions available right now — check back soon.
        </Typography>
        <Button variant="outlined" onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </Box>
    );
  }

  if (index >= questions.length) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", textAlign: "center", mt: 6 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {percentage >= 70 ? "🎉" : "💪"}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Session Complete
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You got {correctCount} out of {questions.length} correct ({percentage}%)
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="outlined"
            onClick={() => {
              setIndex(0);
              setCorrectCount(0);
              setSelected(null);
              setFeedback(null);
            }}
          >
            Practice Again
          </Button>
          <Button variant="contained" onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </Button>
        </Box>
      </Box>
    );
  }

  const options: { key: OptionKey; text: string }[] = [
    { key: "A", text: question.optionA },
    { key: "B", text: question.optionB },
    { key: "C", text: question.optionC },
    { key: "D", text: question.optionD },
  ];

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      {/* Progress header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton size="small" onClick={() => navigate(`/courses/${courseId}`)}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress variant="determinate" value={(index / questions.length) * 100} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, textAlign: "right" }}>
          {index + 1} / {questions.length}
        </Typography>
      </Box>

      {/* Question card */}
      <Fade in key={question.id}>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.5, flexGrow: 1 }}>
              {question.question}
            </Typography>
            <IconButton
              size="small"
              onClick={() => toggleBookmark.mutate({ resourceType: "MCQ", resourceId: question.id })}
              sx={{ ml: 1, flexShrink: 0 }}
            >
              {bookmarks?.some((b) => b.resourceId === question.id) ? (
                <BookmarkIcon color="primary" />
              ) : (
                <BookmarkBorderIcon />
              )}
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {options.map((opt) => {
              const isSelected = selected === opt.key;
              const isCorrectOption = feedback && opt.key === feedback.correctOption;
              const isWrongSelected = feedback && isSelected && !feedback.isCorrect;

              let borderColor = "#E5E7EB";
              let bgColor = "#fff";
              if (isCorrectOption) {
                borderColor = "#16A34A";
                bgColor = "#F0FDF4";
              } else if (isWrongSelected) {
                borderColor = "#DC2626";
                bgColor = "#FEF2F2";
              } else if (isSelected) {
                borderColor = "#2563EB";
                bgColor = "#EFF6FF";
              }

              return (
                <Box
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.75,
                    border: `2px solid ${borderColor}`,
                    bgcolor: bgColor,
                    borderRadius: 2,
                    cursor: feedback ? "default" : "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": !feedback ? { borderColor: "#93C5FD", bgcolor: "#F8FAFC" } : {},
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: `2px solid ${borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: borderColor === "#E5E7EB" ? "text.secondary" : borderColor,
                      flexShrink: 0,
                    }}
                  >
                    {opt.key}
                  </Box>
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {opt.text}
                  </Typography>
                  {isCorrectOption && <CheckCircleIcon sx={{ color: "#16A34A" }} />}
                  {isWrongSelected && <CancelIcon sx={{ color: "#DC2626" }} />}
                </Box>
              );
            })}
          </Box>

          {feedback && (
            <Fade in>
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: feedback.isCorrect ? "#F0FDF4" : "#FEF2F2",
                  border: `1px solid ${feedback.isCorrect ? "#BBF7D0" : "#FECACA"}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color={feedback.isCorrect ? "success.main" : "error.main"}>
                  {feedback.isCorrect ? "Correct!" : "Not quite"}
                </Typography>
                {feedback.explanation && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {feedback.explanation}
                  </Typography>
                )}
              </Box>
            </Fade>
          )}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            {feedback && (
              <Button variant="contained" onClick={handleNext} size="large">
                {index + 1 === questions.length ? "Finish" : "Next Question"}
              </Button>
            )}
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}
