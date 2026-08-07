import { useNavigate } from "react-router-dom";
import { Box, Card, CardActionArea, CardContent, Chip, Grid, Typography, CircularProgress } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LockOpenIcon from "@mui/icons-material/LockOpenOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import { useCourses, useMySubscriptions } from "../../hooks/useCourse";

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
          return (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card elevation={0} sx={{ border: "1px solid #E5E7EB", height: "100%" }}>
                <CardActionArea onClick={() => navigate(`/courses/${course.id}`)} sx={{ height: "100%", p: 1 }}>
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
                    <Typography variant="h6" fontWeight={700}>
                      {course.name}
                    </Typography>
                    {course.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {course.description}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
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
