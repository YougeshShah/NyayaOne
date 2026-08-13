import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import { useStudyAnalytics, useMyTestAttempts } from "../../hooks/useProgress";

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #E5E7EB", borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: "#EFF6FF",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={800}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export function MyProgressPage() {
  const { data: analytics, isLoading: loadingAnalytics } = useStudyAnalytics();
  const { data: attempts, isLoading: loadingAttempts } = useMyTestAttempts();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        My Progress
      </Typography>

      {loadingAnalytics ? (
        <CircularProgress size={24} />
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Tests Taken" value={analytics?.testsTaken ?? 0} icon={<QuizIcon />} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Average Score" value={`${analytics?.averageScorePercent ?? 0}%`} icon={<TrendingUpIcon />} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Practice Questions" value={analytics?.practiceQuestionsAnswered ?? 0} icon={<QuizIcon />} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Practice Accuracy" value={`${analytics?.practiceAccuracyPercent ?? 0}%`} icon={<TrendingUpIcon />} />
          </Grid>
        </Grid>
      )}

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
        Test History
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test</TableCell>
              <TableCell align="center">Score</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingAttempts && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loadingAttempts && (attempts ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No mock tests taken yet — go practice one!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {attempts?.map((attempt) => (
              <TableRow key={attempt.id} hover>
                <TableCell>{attempt.mockTest.title}</TableCell>
                <TableCell align="center">
                  {attempt.submittedAt ? `${attempt.score}/${attempt.totalQuestions}` : "—"}
                </TableCell>
                <TableCell align="center">
                  {attempt.submittedAt ? (
                    <Chip label="Completed" size="small" color="success" />
                  ) : (
                    <Chip label="In Progress" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {new Date(attempt.startedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
