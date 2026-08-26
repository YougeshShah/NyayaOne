import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usageStatusApi } from "../../api/usageStatus.api";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import TimerIcon from "@mui/icons-material/TimerOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import StyleIcon from "@mui/icons-material/StyleOutlined";
import MicIcon from "@mui/icons-material/MicOutlined";
import VideocamIcon from "@mui/icons-material/VideocamOutlined";
import MenuBookIconOutlined from "@mui/icons-material/MenuBookOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useCourse, useSubjects, useMockTests, useMySubscriptions } from "../../hooks/useCourse";
import { useLiveClasses, usePastLiveClasses, useJoinLiveClass } from "../../hooks/useLiveClass";
import { SubscribeDialog } from "../../components/common/SubscribeDialog";

const categoryGradient: Record<string, string> = {
  LAW: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
  LANGUAGE: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
  OTHER: "linear-gradient(135deg, #059669 0%, #047857 100%)",
};

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { data: course } = useCourse(courseId);
  const { data: usageStatus } = useQuery({
    queryKey: ["usage-status", courseId],
    queryFn: () => usageStatusApi.getStatus(courseId as string),
    enabled: !!courseId,
  });
  const { data: subjects } = useSubjects(courseId);
  const { data: mockTests } = useMockTests(courseId);
  const { data: liveClasses } = useLiveClasses(courseId);
  const { data: pastClasses } = usePastLiveClasses(courseId);
  const joinLiveClass = useJoinLiveClass();
  const { data: subscriptions } = useMySubscriptions();
  const isSubscribed = (subscriptions ?? []).some(
    (s) => s.courseId === courseId && (s.status === "ACTIVE" || s.status === "TRIAL")
  );
  const handleJoinClass = (id: string) => {
    joinLiveClass.mutate(id, {
      onSuccess: (data) => window.open(data.meetingUrl, "_blank"),
      onError: (err: any) => alert(err?.response?.data?.message || "Could not join this class."),
    });
  };

  if (!course) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const recordingsCount = pastClasses?.filter((c) => c.recordingUrl).length ?? 0;
  const gradient = categoryGradient[course.category] ?? categoryGradient.OTHER;

  return (
    <Box>
      <IconButton onClick={() => navigate("/")} size="small" sx={{ mb: 1 }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      {/* Hero header */}
      <Paper
        elevation={0}
        sx={{
          background: gradient,
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          color: "#fff",
          mb: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography variant="h5" fontWeight={800}>
              {course.name}
            </Typography>
            {course.description && (
              <Typography variant="body2" sx={{ mt: 0.75, maxWidth: 520, opacity: 0.92 }}>
                {course.description}
              </Typography>
            )}
          </Box>
          {isSubscribed ? (
            <Chip icon={<CheckCircleIcon sx={{ color: "#fff !important" }} />} label="Subscribed" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600 }} />
          ) : (
            <Button variant="contained" sx={{ bgcolor: "#fff", color: "#111827", fontWeight: 700, "&:hover": { bgcolor: "#F3F4F6" } }} onClick={() => setSubscribeOpen(true)}>
              Subscribe to Unlock Everything
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, mt: 2.5, flexWrap: "wrap" }}>
          <Button size="small" variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }} startIcon={<MenuBookIconOutlined />} onClick={() => navigate(`/courses/${courseId}/library`)}>
            Library
          </Button>
          <Button size="small" variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }} startIcon={<StyleIcon />} onClick={() => navigate(`/courses/${courseId}/flashcards`)}>
            Flashcards
          </Button>
          {course?.category === "LANGUAGE" && (
            <Button size="small" variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }} startIcon={<MicIcon />} onClick={() => navigate(`/courses/${courseId}/speaking`)}>
              Speaking
            </Button>
          )}
        </Box>

        {usageStatus && (
          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            {!usageStatus.practice.unlimited && (
              <Chip size="small" label={`Practice: ${usageStatus.practice.remaining}/${usageStatus.practice.limit} left`} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }} />
            )}
            {!usageStatus.mockTest.unlimited && (
              <Chip size="small" label={`Mock Test: ${usageStatus.mockTest.remaining}/${usageStatus.mockTest.limit} left`} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }} />
            )}
            {!usageStatus.speaking.unlimited && (
              <Chip size="small" label={`Speaking: ${usageStatus.speaking.remaining}/${usageStatus.speaking.limit} left`} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }} />
            )}
          </Box>
        )}
      </Paper>

      {!isSubscribed && (
        <Box sx={{ bgcolor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="body2">
            🔓 You're browsing free demo content. Subscribe to unlock all questions, mock tests, and live classes.
          </Typography>
        </Box>
      )}

      {/* Tabs to organize content instead of one long scroll */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: "1px solid #E5E7EB" }}>
        <Tab label={`Practice (${subjects?.length ?? 0})`} />
        <Tab label={`Mock Tests (${mockTests?.length ?? 0})`} />
        <Tab label={`Live Classes (${liveClasses?.length ?? 0})`} />
        {recordingsCount > 0 && <Tab label={`Recordings (${recordingsCount})`} />}
      </Tabs>

      {/* Tab 0 — Practice by Subject */}
      {tab === 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Choose a Subject
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
            {subjects?.map((subject) => (
              <Chip
                key={subject.id}
                label={subject.name}
                onClick={() => setSelectedSubjectId(subject.id)}
                color={selectedSubjectId === subject.id ? "primary" : undefined}
                variant={selectedSubjectId === subject.id ? "filled" : "outlined"}
                clickable
                sx={{ borderRadius: 2 }}
              />
            ))}
            {subjects?.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No subjects added yet.
              </Typography>
            )}
          </Box>
          {selectedSubjectId && (
            <Button
              variant="contained"
              size="large"
              startIcon={<QuizIcon />}
              onClick={() => navigate(`/courses/${courseId}/practice?subjectId=${selectedSubjectId}`)}
            >
              Start Practicing This Subject
            </Button>
          )}
        </Box>
      )}

      {/* Tab 1 — Mock Tests */}
      {tab === 1 && (
        <Grid container spacing={2}>
          {mockTests?.map((test) => {
            const locked = !isSubscribed && !test.isFreeDemo;
            return (
              <Grid item xs={12} sm={6} key={test.id}>
                <Card elevation={0} sx={{ border: "1px solid #F1F5F9", borderRadius: 2.5, transition: "box-shadow 0.2s ease", "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.07)" } }}>
                  <CardActionArea disabled={locked} onClick={() => navigate(`/courses/${courseId}/mock-test/${test.id}`)} sx={{ p: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <QuizIcon sx={{ color: "#2563EB", fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {test.title}
                            </Typography>
                            {locked && <LockIcon fontSize="small" color="disabled" />}
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary", flexWrap: "wrap" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <TimerIcon fontSize="small" />
                              <Typography variant="caption">{test.durationMinutes} min</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <QuizIcon fontSize="small" />
                              <Typography variant="caption">{test._count?.questions ?? 0} questions</Typography>
                            </Box>
                            {!!(test as any).negativeMarkingPercent && (
                              <Chip label={`⚠️ ${(test as any).negativeMarkingPercent}% negative marking`} size="small" color="warning" sx={{ height: 20 }} />
                            )}
                            {test.isFreeDemo && <Chip label="Free" size="small" color="success" sx={{ height: 20 }} />}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
          {mockTests?.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                No mock tests published yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab 2 — Live Classes */}
      {tab === 2 && (
        <Grid container spacing={2}>
          {liveClasses?.map((cls) => {
            const locked = !isSubscribed && !cls.isFreeDemo;
            return (
              <Grid item xs={12} sm={6} key={cls.id}>
                <Card elevation={0} sx={{ border: "1px solid #F1F5F9", borderRadius: 2.5 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <VideocamIcon sx={{ color: "#D97706", fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {cls.title}
                          </Typography>
                          {locked && <LockIcon fontSize="small" color="disabled" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(cls.scheduledAt).toLocaleString()} · {cls.durationMinutes} min
                        </Typography>
                        {cls.isFreeDemo && <Chip label="Free" size="small" color="success" sx={{ mt: 1 }} />}
                        <Box sx={{ mt: 1.5 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<VideocamIcon />}
                            disabled={locked || joinLiveClass.isPending}
                            onClick={() => handleJoinClass(cls.id)}
                          >
                            {locked ? "Subscribe to Join" : "Join Class"}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          {liveClasses?.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                No live classes scheduled right now.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab 3 — Recordings */}
      {tab === 3 && recordingsCount > 0 && (
        <Grid container spacing={2}>
          {pastClasses
            ?.filter((c) => c.recordingUrl)
            .map((cls) => (
              <Grid item xs={12} sm={6} key={cls.id}>
                <Card elevation={0} sx={{ border: "1px solid #F1F5F9", borderRadius: 2.5 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <PlayCircleOutlineIcon sx={{ color: "#059669", fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {cls.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                          {new Date(cls.scheduledAt).toLocaleDateString()}
                        </Typography>
                        <Button variant="outlined" size="small" onClick={() => window.open(cls.recordingUrl!, "_blank")}>
                          Watch Recording
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      <SubscribeDialog open={subscribeOpen} onClose={() => setSubscribeOpen(false)} courseId={courseId as string} courseName={course.name} />
    </Box>
  );
}
