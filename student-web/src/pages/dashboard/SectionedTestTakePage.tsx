import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Divider,
  Tooltip,
} from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/HeadphonesOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import EditNoteIcon from "@mui/icons-material/EditNoteOutlined";
import MicIcon from "@mui/icons-material/MicNoneOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useMockTestDetail, useStartAttempt, useSubmitAttempt, useSubmitWriting } from "../../hooks/useCourse";
import { TestAttemptResult } from "../../types/course.types";
import { TestSection } from "../../api/testSection.api";

type OptionKey = "A" | "B" | "C" | "D";

// Question Bank content embeds the passage/transcript directly inside each
// question's text (e.g. "Reading Passage: \"...\"\n\n<question>"), a
// convention built for the flat Practice page. When those same questions
// get randomly pulled into a sectioned Mock Test, the section's own
// dedicated passageText field is left empty — this extracts the passage
// from the first question so it can still be shown once in the side
// panel, and strips it from each individual question so it isn't repeated.
function splitEmbeddedPassage(text: string): { passage: string | null; question: string } {
  const match = text.match(/^(?:Reading Passage|Listening Transcript):\s*"([\s\S]*?)"\s*\n\n([\s\S]*)$/);
  if (match) {
    return { passage: match[1], question: match[2] };
  }
  return { passage: null, question: text };
}

const sectionMeta: Record<string, { icon: JSX.Element; label: string }> = {
  READING: { icon: <MenuBookIcon fontSize="small" />, label: "Reading" },
  LISTENING: { icon: <HeadphonesIcon fontSize="small" />, label: "Listening" },
  WRITING: { icon: <EditNoteIcon fontSize="small" />, label: "Writing" },
  SPEAKING: { icon: <MicIcon fontSize="small" />, label: "Speaking" },
  MCQ: { icon: <MenuBookIcon fontSize="small" />, label: "Questions" },
};

export function SectionedTestTakePage() {
  const { courseId, mockTestId } = useParams<{ courseId: string; mockTestId: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading } = useMockTestDetail(mockTestId);
  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();
  const submitWriting = useSubmitWriting();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey | null>>({});
  const [essays, setEssays] = useState<Record<string, string>>({});
  const [writingSubmitted, setWritingSubmitted] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<TestAttemptResult | null>(null);
  const questionsPaneRef = useRef<HTMLDivElement>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (test?.durationMinutes && attemptId && !result) {
      setSecondsLeft(test.durationMinutes * 60);
    }
  }, [test?.durationMinutes, attemptId, result]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      // Time's up — auto-submit whatever has been answered so far, just
      // like a real exam ending the session at the bell.
      if (attemptId) {
        submitAttempt.mutate(
          { attemptId, answers: Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption })) },
          { onSuccess: (data) => setResult(data) }
        );
      }
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  const formattedTimeLeft =
    secondsLeft !== null
      ? `${Math.floor(secondsLeft / 3600)
          .toString()
          .padStart(2, "0")}:${Math.floor((secondsLeft % 3600) / 60)
          .toString()
          .padStart(2, "0")}:${(secondsLeft % 60).toString().padStart(2, "0")}`
      : null;

  useEffect(() => {
    if (test && !attemptId && !startAttempt.isPending) {
      startAttempt.mutate(mockTestId as string, { onSuccess: (data) => setAttemptId(data.attemptId) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test]);

  // Jumping between sections should feel like a fresh screen, not a
  // continuation of wherever the reader last scrolled to.
  useEffect(() => {
    questionsPaneRef.current?.scrollTo({ top: 0 });
  }, [activeSectionIndex]);

  const sections: TestSection[] = test?.sections ?? [];
  const hasSections = sections.length > 0;
  const effectiveSections: TestSection[] = hasSections
    ? sections
    : [
        {
          id: "flat",
          type: "MCQ",
          title: "Questions",
          passageText: null,
          audioUrl: null,
          writingPrompt: null,
          minWordCount: null,
          timeLimitMinutes: null,
          order: 0,
          mockTestQuestions: (test?.questions ?? []).map((q: any) => ({ questionId: q.questionId, order: q.order, question: q.question })),
        },
      ];
  const activeSection = effectiveSections[activeSectionIndex];
  const isLastSection = activeSectionIndex === effectiveSections.length - 1;
  const hasSidePanel = activeSection?.type === "READING" || activeSection?.type === "LISTENING";

  // Fall back to extracting the passage/transcript from the first question
  // when the section itself has no dedicated passageText set (see
  // splitEmbeddedPassage comment above for why this happens).
  const derivedPassage =
    activeSection && !activeSection.passageText && activeSection.mockTestQuestions.length > 0
      ? splitEmbeddedPassage(activeSection.mockTestQuestions[0].question.question).passage
      : null;
  const displayPassageText = activeSection?.passageText || derivedPassage;

  const handleSubmitWriting = (sectionId: string) => {
    if (!attemptId) return;
    submitWriting.mutate(
      { sectionId, attemptId, essayText: essays[sectionId] ?? "" },
      { onSuccess: () => setWritingSubmitted((prev) => ({ ...prev, [sectionId]: true })) }
    );
  };

  const handleFinish = useCallback(() => {
    if (!attemptId) return;
    const mcqAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption }));
    submitAttempt.mutate({ attemptId, answers: mcqAnswers }, { onSuccess: (data) => setResult(data) });
  }, [attemptId, answers, submitAttempt]);

  if (isLoading || !test) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (result) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", textAlign: "center", mt: 6 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Test Submitted
        </Typography>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3, my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            MCQ sections: {result.score}/{result.totalQuestions} correct ({result.percentage}%)
          </Typography>
          {result.negativeMarkingApplied && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Marks (with negative marking): {result.marksScored} / {result.totalMarks}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Writing sections are graded manually — check back later for your band score.
          </Typography>
        </Paper>
        <Button variant="contained" onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </Box>
    );
  }

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const renderQuestions = (compact: boolean) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: compact ? 2.5 : 3 }}>
      {activeSection.mockTestQuestions.map((mq, qi) => (
        <Box key={mq.questionId}>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
            {qi + 1}. {splitEmbeddedPassage(mq.question.question).question}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(["A", "B", "C", "D"] as OptionKey[]).map((key) => {
              const optionText = mq.question[`option${key}` as "optionA"];
              const isSelected = answers[mq.questionId] === key;
              return (
                <Box
                  key={key}
                  onClick={() => setAnswers((prev) => ({ ...prev, [mq.questionId]: key }))}
                  sx={{
                    p: 1.25,
                    border: `1px solid ${isSelected ? "#2563EB" : "#E5E7EB"}`,
                    bgcolor: isSelected ? "#EFF6FF" : "#fff",
                    borderRadius: 1.5,
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    "&:hover": { borderColor: "#93C5FD" },
                  }}
                >
                  <Typography variant="body2">
                    {key}. {optionText}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 96px)" }}>
      {/* Section tabs — each tab is a distinct "part" of the exam, matching
          the real IELTS computer-delivered structure (separate timed
          sections, not one long scroll). */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h6" fontWeight={700} sx={{ mr: 2 }}>
          {test.title}
        </Typography>
        {formattedTimeLeft && (
          <Chip
            label={`⏱ ${formattedTimeLeft}`}
            color={secondsLeft !== null && secondsLeft < 300 ? "error" : "default"}
            sx={{ mr: 2, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
          />
        )}
        {effectiveSections.map((s, i) => {
          const meta = sectionMeta[s.type] ?? sectionMeta.MCQ;
          const isDone = s.type === "WRITING" ? writingSubmitted[s.id] : s.mockTestQuestions.every((q) => answers[q.questionId]);
          return (
            <Chip
              key={s.id}
              icon={meta.icon}
              label={s.title}
              onClick={() => setActiveSectionIndex(i)}
              color={activeSectionIndex === i ? "primary" : isDone ? "success" : "default"}
              variant={activeSectionIndex === i ? "filled" : "outlined"}
              sx={{ fontWeight: 600 }}
            />
          );
        })}
      </Box>

      {/* Split-screen for Reading/Listening: reference material stays fixed
          on the left while questions scroll independently on the right —
          this is the layout every real computer-based exam uses, since
          re-reading the passage while answering shouldn't cost your place
          in the question list. */}
      {hasSidePanel ? (
        <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0 }}>
          <Paper
            elevation={0}
            sx={{
              flex: "0 0 45%",
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              p: 3,
              overflowY: "auto",
              bgcolor: "#FAFBFC",
            }}
          >
            <Chip
              size="small"
              icon={sectionMeta[activeSection.type].icon}
              label={sectionMeta[activeSection.type].label}
              sx={{ mb: 2 }}
            />
            {activeSection.type === "READING" && displayPassageText && (
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>
                {displayPassageText}
              </Typography>
            )}
            {activeSection.type === "LISTENING" && activeSection.audioUrl && (
              <Box sx={{ position: "sticky", top: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Listen carefully — in the real exam, audio plays only once. Answer as you listen.
                </Typography>
                <audio controls src={activeSection.audioUrl} style={{ width: "100%" }} />
              </Box>
            )}
          </Paper>

          <Box ref={questionsPaneRef} sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
            <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3 }}>
              {renderQuestions(true)}
            </Paper>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3, maxWidth: 800 }}>
            <Chip size="small" icon={sectionMeta[activeSection.type].icon} label={sectionMeta[activeSection.type].label} sx={{ mb: 2 }} />

            {(activeSection.type === "MCQ") && renderQuestions(false)}

            {activeSection.type === "WRITING" && (
              <Box>
                {activeSection.writingPrompt && (
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                    {activeSection.writingPrompt}
                  </Typography>
                )}
                {activeSection.minWordCount && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Minimum {activeSection.minWordCount} words
                  </Typography>
                )}
                {writingSubmitted[activeSection.id] ? (
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    Submitted — awaiting grading.
                  </Typography>
                ) : (
                  <>
                    <TextField
                      multiline
                      rows={14}
                      fullWidth
                      placeholder="Write your response here..."
                      value={essays[activeSection.id] ?? ""}
                      onChange={(e) => setEssays((prev) => ({ ...prev, [activeSection.id]: e.target.value }))}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {wordCount(essays[activeSection.id] ?? "")} words
                      </Typography>
                      <Button variant="contained" size="small" onClick={() => handleSubmitWriting(activeSection.id)} disabled={submitWriting.isPending}>
                        Submit Essay
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            )}

            {activeSection.type === "SPEAKING" && (
              <Box>
                {activeSection.writingPrompt ? (
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>
                    {activeSection.writingPrompt}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No topic set for this Speaking part yet.
                  </Typography>
                )}
                {activeSection.timeLimitMinutes && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                    Suggested time: {activeSection.timeLimitMinutes} minute{activeSection.timeLimitMinutes !== 1 ? "s" : ""}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Speaking is assessed live — practice this topic out loud, or check the course page for a scheduled
                  Speaking session with an instructor.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Footer nav — "Next Part" moves through the exam's timed sections
          one at a time; the final section surfaces "Finish Test" instead. */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button disabled={activeSectionIndex === 0} onClick={() => setActiveSectionIndex((i) => i - 1)}>
          Previous Part
        </Button>
        {!isLastSection ? (
          <Tooltip title="Answers are saved automatically as you go">
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => setActiveSectionIndex((i) => i + 1)}>
              Next Part
            </Button>
          </Tooltip>
        ) : (
          <Button variant="contained" color="secondary" onClick={handleFinish} disabled={submitAttempt.isPending}>
            {submitAttempt.isPending ? "Submitting..." : "Finish Test"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
