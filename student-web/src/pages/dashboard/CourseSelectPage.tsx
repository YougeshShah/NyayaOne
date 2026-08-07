import { useNavigate } from "react-router-dom";
import { Box, Card, CardActionArea, CardContent, Chip, Grid, Typography, CircularProgress, Divider, Button } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LockOpenIcon from "@mui/icons-material/LockOpenOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCourses, useMySubscriptions } from "../../hooks/useCourse";

const categoryLabel: Record<string, string> = {
  LAW: "Law",
  LANGUAGE: "Language",
  OTHER: "General",
};

export function CourseSelectPage() {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCourses();
  const { data: subscriptions } = useMySubscriptions();

  const subscribedCourseIds = new Set(
    (subscriptions ?? []).filter((s) => s.status === "ACTIVE" || s.status === "TRIAL").map((s) => s.courseId)
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Choose Your Course
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Practice free demo questions in any course, or subscribe to unlock everything.
      </Typography>

      <Grid container spacing={3}>
        {courses?.map((course) => {
          const isSubscribed = subscribedCourseIds.has(course.id);
          const subjectCount = course._count?.subjects ?? 0;
          const questionCount = course._count?.mcqQuestions ?? 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card elevation={0} sx={{ border: "1px solid #E5E7EB", height: "100%", display: "flex", flexDirection: "column" }}>
                <CardActionArea onClick={() => navigate(`/courses/${course.id}`)} sx={{ flexGrow: 1, p: 1 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
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

                    {/* At-a-glance stats — a course card with just a name and
                        badge doesn't tell a student whether it's worth
                        clicking into; this gives them something concrete
                        before committing. */}
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

      {courses?.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          No courses available yet — check back soon.
        </Typography>
      )}
    </Box>
  );
}
