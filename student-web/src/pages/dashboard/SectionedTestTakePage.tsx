import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/HeadphonesOutlined";
import { useMockTestDetail, useStartAttempt, useSubmitAttempt, useSubmitWriting } from "../../hooks/useCourse";
import { TestSection } from "../../api/testSection.api";

type OptionKey = "A" | "B" | "C" | "D";

export function SectionedTestTakePage() {
  const { courseId, mockTestId } = useParams<{ courseId: string; mockTestId: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading } = useMockTestDetail(mockTestId);
  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();
  const submitWriting = useSubmitWriting();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey | null>>({});
  const [essays, setEssays] = useState<Record<string, string>>({});
  const [writingSubmitted, setWritingSubmitted] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{ score: number; totalQuestions: number; percentage: number } | null>(null);

  useEffect(() => {
    if (test && !attemptId && !startAttempt.isPending) {
      startAttempt.mutate(mockTestId as string, { onSuccess: (data) => setAttemptId(data.attemptId) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test]);

  const sections: TestSection[] = test?.sections ?? [];
  const hasSections = sections.length > 0;
  // Flat tests (no sections defined — e.g. existing Law-style tests) get
  // wrapped as a single synthetic "All Questions" section so the same
  // rendering path handles both cases without a separate page.
  const effectiveSections: TestSection[] = hasSections
    ? sections
    : [
        {
          id: "flat",
          type: "MCQ",
          title: "All Questions",
          passageText: null,
          audioUrl: null,
          writingPrompt: null,
          minWordCount: null,
          timeLimitMinutes: null,
          order: 0,
          mockTestQuestions: (test?.questions ?? []).map((q: any) => ({ questionId: q.questionId, order: q.order, question: q.question })),
        },
      ];
  const activeSection = effectiveSections[activeTab];

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
            MCQ sections: {result.score}/{result.totalQuestions} ({result.percentage}%)
          </Typography>
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

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {test.title}
      </Typography>

      {effectiveSections.length > 1 && (
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: "1px solid #E5E7EB" }}>
          {effectiveSections.map((s, i) => (
            <Tab key={s.id} label={s.title} value={i} />
          ))}
        </Tabs>
      )}

      {activeSection && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 3, mb: 3 }}>
          <Chip label={activeSection.type} size="small" sx={{ mb: 2 }} />

          {/* Reading passage */}
          {activeSection.type === "READING" && activeSection.passageText && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2, mb: 3, maxHeight: 300, overflow: "auto" }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {activeSection.passageText}
              </Typography>
            </Paper>
          )}

          {/* Listening audio */}
          {activeSection.type === "LISTENING" && activeSection.audioUrl && (
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <HeadphonesIcon color="primary" />
              <audio controls src={activeSection.audioUrl} style={{ width: "100%" }} />
            </Box>
          )}

          {/* MCQ / Reading / Listening questions */}
          {(activeSection.type === "MCQ" || activeSection.type === "READING" || activeSection.type === "LISTENING") && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {activeSection.mockTestQuestions.map((mq, qi) => (
                <Box key={mq.questionId}>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                    {qi + 1}. {mq.question.question}
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
          )}

          {/* Writing task */}
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
                    rows={12}
                    fullWidth
                    placeholder="Write your response here..."
                    value={essays[activeSection.id] ?? ""}
                    onChange={(e) => setEssays((prev) => ({ ...prev, [activeSection.id]: e.target.value }))}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {wordCount(essays[activeSection.id] ?? "")} words
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSubmitWriting(activeSection.id)}
                      disabled={submitWriting.isPending}
                    >
                      Submit Essay
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}

          {/* Speaking */}
          {activeSection.type === "SPEAKING" && (
            <Typography variant="body2" color="text.secondary">
              Speaking practice happens via a scheduled Live Class — check the course page for upcoming sessions.
            </Typography>
          )}
        </Paper>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="secondary" onClick={handleFinish} disabled={submitAttempt.isPending}>
          {submitAttempt.isPending ? "Submitting..." : "Finish Test"}
        </Button>
      </Box>
    </Box>
  );
}
