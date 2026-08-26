import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Paper,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LockOpenIcon from "@mui/icons-material/LockOpenOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import { useCourses, useMySubscriptions } from "../../hooks/useCourse";
import { useAuthStore } from "../../store/authStore";

const categoryLabel: Record<string, string> = {
  LAW: "Law",
  LANGUAGE: "Language",
  OTHER: "General",
};

// A different gradient per category keeps the grid visually varied instead
// of every card icon being the same flat block of color.
const categoryGradient: Record<string, string> = {
  LAW: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
  LANGUAGE: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
  OTHER: "linear-gradient(135deg, #059669 0%, #047857 100%)",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function CourseSelectPage() {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCourses();
  const { data: subscriptions } = useMySubscriptions();
  const user = useAuthStore((s) => s.user);
  const preferredCourseId = useAuthStore((s) => s.user?.preferredCourseId);
  const [search, setSearch] = useState("");

  const subscribedCourseIds = new Set(
    (subscriptions ?? []).filter((s) => s.status === "ACTIVE" || s.status === "TRIAL").map((s) => s.courseId)
  );

  const sortedCourses = useMemo(() => {
    const base = [...(courses ?? [])].sort((a, b) => {
      if (a.id === preferredCourseId) return -1;
      if (b.id === preferredCourseId) return 1;
      return 0;
    });
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter((c) => c.name.toLowerCase().includes(q) || (categoryLabel[c.category] ?? c.category).toLowerCase().includes(q));
  }, [courses, preferredCourseId, search]);

  const activeSubscriptionCount = subscribedCourseIds.size;
  const totalQuestionsAvailable = (courses ?? []).reduce((sum, c) => sum + (c._count?.mcqQuestions ?? 0), 0);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Personalized greeting header */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {getGreeting()}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {activeSubscriptionCount > 0
          ? "Pick up where you left off, or explore something new."
          : "Practice free demo questions in any course, or subscribe to unlock everything."}
      </Typography>

      {/* Quick stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ bgcolor: "#EFF6FF", borderRadius: "50%", p: 1, display: "flex" }}>
              <WorkspacePremiumIcon sx={{ color: "#2563EB", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {activeSubscriptionCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active Subscriptions
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ bgcolor: "#F0FDF4", borderRadius: "50%", p: 1, display: "flex" }}>
              <TrendingUpIcon sx={{ color: "#059669", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {(courses ?? []).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Courses Available
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ bgcolor: "#FEF3C7", borderRadius: "50%", p: 1, display: "flex" }}>
              <QuizIcon sx={{ color: "#D97706", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {totalQuestionsAvailable.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Practice Questions
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Search bar */}
      <TextField
        placeholder="Search courses..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, maxWidth: 420 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {sortedCourses.map((course) => {
          const isSubscribed = subscribedCourseIds.has(course.id);
          const isRecommended = course.id === preferredCourseId;
          const subjectCount = course._count?.subjects ?? 0;
          const questionCount = course._count?.mcqQuestions ?? 0;
          const gradient = categoryGradient[course.category] ?? categoryGradient.OTHER;
          return (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #F1F5F9",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRadius: 3,
                  bgcolor: "#fff",
                  overflow: "visible", // MUI Card clips overflow by default -- the "Recommended" badge sits partly above the card border and was being cut off by that clipping
                  transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  "&:hover": {
                    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.08), 0 12px 28px rgba(0,0,0,0.10)",
                    transform: "translateY(-3px)",
                  },
                  "&:active": {
                    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.14), 0 6px 16px rgba(0,0,0,0.08)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {isRecommended && (
                  <Chip
                    label="Recommended for you"
                    color="primary"
                    size="small"
                    sx={{ position: "absolute", top: -12, left: 16, fontWeight: 700, zIndex: 1 }}
                  />
                )}
                <CardActionArea onClick={() => navigate(`/courses/${course.id}`)} sx={{ flexGrow: 1, p: 1 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2.5,
                          background: gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        }}
                      >
                        <SchoolIcon sx={{ color: "#fff" }} />
                      </Box>
                      {isSubscribed ? (
                        <Chip icon={<LockOpenIcon />} label="Subscribed" color="success" size="small" />
                      ) : (
                        <Chip icon={<LockIcon />} label="Free Demo" size="small" variant="outlined" />
                      )}
                    </Box>
                    <Chip label={categoryLabel[course.category] ?? course.category} size="small" sx={{ mb: 1, height: 20, fontSize: 11 }} />
                    <Typography variant="h6" fontWeight={700}>
                      {course.name}
                    </Typography>
                    {course.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        {course.description}
                      </Typography>
                    )}
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: "flex", gap: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <MenuBookIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {subjectCount} {subjectCount === 1 ? "subject" : "subjects"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <QuizIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {questionCount} {questionCount === 1 ? "question" : "questions"}
                        </Typography>
                      </Box>
                    </Box>
                 </CardContent>
                </CardActionArea>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Button
                    fullWidth
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    {isSubscribed ? "Continue Learning" : "Explore & Try Free"}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {sortedCourses.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          {search ? `No courses matching "${search}".` : "No courses available yet — check back soon."}
        </Typography>
      )}
    </Box>
  );
}
