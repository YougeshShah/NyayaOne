import { useState } from "react";
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
  Divider,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import TimerIcon from "@mui/icons-material/TimerOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import StyleIcon from "@mui/icons-material/StyleOutlined";
import VideocamIcon from "@mui/icons-material/VideocamOutlined";
import MenuBookIconOutlined from "@mui/icons-material/MenuBookOutlined";
import { useCourse, useSubjects, useMockTests, useMySubscriptions } from "../../hooks/useCourse";
import { useLiveClasses, usePastLiveClasses, useJoinLiveClass } from "../../hooks/useLiveClass";
import { SubscribeDialog } from "../../components/common/SubscribeDialog";

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const { data: course } = useCourse(courseId);
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

  return (
    <Box>
      <IconButton onClick={() => navigate("/")} size="small" sx={{ mb: 1 }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {course.name}
          </Typography>
          {course.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 500 }}>
              {course.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<MenuBookIconOutlined />} onClick={() => navigate(`/courses/${courseId}/library`)}>
            Library
          </Button>
          <Button variant="outlined" startIcon={<StyleIcon />} onClick={() => navigate(`/courses/${courseId}/flashcards`)}>
            Flashcards
          </Button>
          {isSubscribed ? (
            <Chip icon={<CheckCircleIcon />} label="Subscribed" color="success" />
          ) : (
            <Button variant="contained" color="secondary" onClick={() => setSubscribeOpen(true)}>
            Subscribe to Unlock Everything
          </Button>
        )}
      </Box>
      </Box>

      {!isSubscribed && (
        <Box sx={{ bgcolor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="body2">
            🔓 You're browsing free demo content. Subscribe to unlock all questions, mock tests, and live classes.
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Subjects */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
        Practice by Subject
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 4 }}>
        {subjects?.map((subject) => (
          <Chip
            key={subject.id}
            label={subject.name}
            onClick={() => setSelectedSubjectId(subject.id)}
            color={selectedSubjectId === subject.id ? "primary" : undefined}
            variant={selectedSubjectId === subject.id ? "filled" : "outlined"}
            clickable
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
          startIcon={<QuizIcon />}
          sx={{ mb: 4 }}
          onClick={() => navigate(`/courses/${courseId}/practice?subjectId=${selectedSubjectId}`)}
        >
          Start Practicing This Subject
        </Button>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Mock Tests */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
        Mock Tests
      </Typography>
      <Grid container spacing={2}>
        {mockTests?.map((test) => {
          const locked = !isSubscribed && !test.isFreeDemo;
          return (
            <Grid item xs={12} sm={6} key={test.id}>
              <Card elevation={0} sx={{ border: "1px solid #E5E7EB" }}>
                <CardActionArea
                  disabled={locked}
                  onClick={() => navigate(`/courses/${courseId}/mock-test/${test.id}`)}
                  sx={{ p: 2 }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {test.title}
                      </Typography>
                      {locked && <LockIcon fontSize="small" color="disabled" />}
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, mt: 1, color: "text.secondary" }}>
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

      <Divider sx={{ my: 3 }} />

      {/* Live Classes */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
        Upcoming Live Classes
      </Typography>
      <Grid container spacing={2}>
        {liveClasses?.map((cls) => {
          const locked = !isSubscribed && !cls.isFreeDemo;
          return (
            <Grid item xs={12} sm={6} key={cls.id}>
              <Card elevation={0} sx={{ border: "1px solid #E5E7EB" }}>
                <CardContent>
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

      {pastClasses?.some((c) => c.recordingUrl) && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Past Class Recordings
          </Typography>
          <Grid container spacing={2}>
            {pastClasses
              .filter((c) => c.recordingUrl)
              .map((cls) => (
                <Grid item xs={12} sm={6} key={cls.id}>
                  <Card elevation={0} sx={{ border: "1px solid #E5E7EB" }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {cls.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                        {new Date(cls.scheduledAt).toLocaleDateString()}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(cls.recordingUrl!, "_blank")}
                      >
                        Watch Recording
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </>
      )}

      <SubscribeDialog open={subscribeOpen} onClose={() => setSubscribeOpen(false)} courseId={courseId as string} courseName={course.name} />
    </Box>
  );
}
