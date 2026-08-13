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
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorderOutlined";
import { useMcqList, useCheckAnswer } from "../../hooks/useCourse";
import { useBookmarks, useToggleBookmark } from "../../hooks/useBookmark";
import { resolveMediaUrl } from "../../api/client";

type OptionKey = "A" | "B" | "C" | "D";

// Some practice questions embed a reading passage ahead of the actual
// question (e.g. `Reading Passage: "..."\n\n<question>`) — split those out
// so the passage renders as reference material instead of running together
// with the question as one wall of text.
function splitPassage(text: string): { passage: string | null; question: string } {
  const match = text.match(/^Reading Passage:\s*"([\s\S]*?)"\s*\n\n([\s\S]*)$/);
  if (match) {
    return { passage: match[1], question: match[2] };
  }
  return { passage: null, question: text };
}

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
  const [textAnswer, setTextAnswer] = useState("");
  const [multiBlankAnswers, setMultiBlankAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctOption?: string;
    correctAnswerText?: string;
    blankResults?: boolean[];
    explanation: string | null;
  } | null>(null);
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

  const handleSubmitText = () => {
    if (!question || feedback || !textAnswer.trim()) return;
    checkAnswer.mutate(
      { id: question.id, selectedOption: textAnswer.trim() },
      {
        onSuccess: (result) => {
          setFeedback(result);
          if (result.isCorrect) setCorrectCount((c) => c + 1);
        },
      }
    );
  };

  const handleSubmitMultiBlank = () => {
    if (!question || feedback || multiBlankAnswers.some((a) => !a?.trim())) return;
    checkAnswer.mutate(
      { id: question.id, selectedOption: multiBlankAnswers.map((a) => a.trim()).join("|") },
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
    setTextAnswer("");
    setMultiBlankAnswers([]);
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

  const { passage, question: questionText } = splitPassage(question.question);
  const isFreeTextAnswer = question.answerType === "FILL_BLANK" || question.answerType === "SHORT_ANSWER";
  const isMultiBlank = question.answerType === "MULTI_BLANK";

  // Splits "...text {{1}} more text {{2}}..." into alternating text/blank
  // segments, so each {{N}} can be rendered as an inline input box in the
  // natural reading flow — the real IELTS form/note/table completion pattern.
  const multiBlankSegments = isMultiBlank ? questionText.split(/(\{\{\d+\}\})/g) : [];
  const blankCount = multiBlankSegments.filter((s) => /^\{\{\d+\}\}$/.test(s)).length;

  const options: { key: OptionKey; text: string }[] = (
    [
      { key: "A" as OptionKey, text: question.optionA },
      { key: "B" as OptionKey, text: question.optionB },
      { key: "C" as OptionKey, text: question.optionC },
      { key: "D" as OptionKey, text: question.optionD },
    ] as { key: OptionKey; text: string | undefined }[]
  ).filter((o): o is { key: OptionKey; text: string } => !!o.text);

  return (
    <Box sx={{ maxWidth: passage ? 1000 : 640, mx: "auto" }}>
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

      {/* Question card — when a reading passage is attached, it gets its
          own fixed reference panel beside the question, same pattern as
          the full Mock Test reading sections. */}
      <Fade in key={question.id}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {passage && (
            <Paper
              elevation={0}
              sx={{ flex: "0 0 42%", border: "1px solid #E5E7EB", borderRadius: 3, p: 3, maxHeight: 560, overflowY: "auto", bgcolor: "#FAFBFC" }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                READING PASSAGE
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>
                {passage}
              </Typography>
            </Paper>
          )}

          <Paper elevation={0} sx={{ flex: 1, p: 3, border: "1px solid #E5E7EB", borderRadius: 3 }}>
          {question.audioUrl && (
            <Box sx={{ mb: 2 }}>
              <audio controls src={resolveMediaUrl(question.audioUrl) ?? undefined} style={{ width: "100%" }} />
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.8, flexGrow: 1 }}>
              {isMultiBlank
                ? multiBlankSegments.map((segment, i) => {
                    const blankMatch = segment.match(/^\{\{(\d+)\}\}$/);
                    if (!blankMatch) return <span key={i}>{segment}</span>;
                    const blankIndex = parseInt(blankMatch[1], 10) - 1;
                    const isBlankWrong = feedback && feedback.blankResults && feedback.blankResults[blankIndex] === false;
                    const isBlankRight = feedback && feedback.blankResults && feedback.blankResults[blankIndex] === true;
                    return (
                      <TextField
                        key={i}
                        size="small"
                        variant="standard"
                        value={multiBlankAnswers[blankIndex] ?? ""}
                        disabled={!!feedback}
                        onChange={(e) => {
                          const next = [...multiBlankAnswers];
                          next[blankIndex] = e.target.value;
                          setMultiBlankAnswers(next);
                        }}
                        sx={{
                          width: 130,
                          mx: 0.5,
                          "& .MuiInput-underline:before": { borderBottomColor: isBlankWrong ? "#DC2626" : isBlankRight ? "#16A34A" : undefined },
                        }}
                      />
                    );
                  })
                : questionText}
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
            {isMultiBlank ? (
              <>
                {!feedback && (
                  <Button
                    variant="contained"
                    onClick={handleSubmitMultiBlank}
                    disabled={multiBlankAnswers.length < blankCount || multiBlankAnswers.some((a) => !a?.trim()) || checkAnswer.isPending}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Submit Answers
                  </Button>
                )}
                {feedback && !feedback.isCorrect && feedback.correctAnswerText && (
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    Correct answers: {feedback.correctAnswerText.split("|").join(", ")}
                  </Typography>
                )}
              </>
            ) : isFreeTextAnswer ? (
              <>
                <TextField
                  fullWidth
                  placeholder="Type your answer..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={!!feedback}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitText()}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderColor: feedback ? (feedback.isCorrect ? "#16A34A" : "#DC2626") : undefined,
                    },
                  }}
                />
                {!feedback && (
                  <Button variant="contained" onClick={handleSubmitText} disabled={!textAnswer.trim() || checkAnswer.isPending}>
                    Submit Answer
                  </Button>
                )}
                {feedback && !feedback.isCorrect && feedback.correctAnswerText && (
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    Correct answer: {feedback.correctAnswerText}
                  </Typography>
                )}
              </>
            ) : (
              options.map((opt) => {
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
            })
            )}
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
        </Box>
      </Fade>
    </Box>
  );
}
