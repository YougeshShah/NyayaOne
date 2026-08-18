import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert } from "@mui/material";
import { institutionStudentApi } from "../../api/institutionStudent.api";

export function PendingApprovalsPage() {
  const qc = useQueryClient();
  const { data: pending, isLoading } = useQuery({
    queryKey: ["pending-students"],
    queryFn: () => institutionStudentApi.list("PENDING_VERIFICATION"),
  });

  const approve = useMutation({
    mutationFn: (id: string) => institutionStudentApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-students"] }),
  });

  const reject = useMutation({
    mutationFn: (id: string) => institutionStudentApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-students"] }),
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Pending Student Approvals
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Students who self-registered on your institution's link, waiting for your approval before they can log in.
      </Typography>

      {pending?.length === 0 && !isLoading && (
        <Alert severity="info">No pending registrations right now.</Alert>
      )}

      {pending && pending.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone ?? "—"}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" sx={{ mr: 1 }} onClick={() => approve.mutate(s.id)} disabled={approve.isPending}>
                      Approve
                    </Button>
                    <Button size="small" color="error" onClick={() => reject.mutate(s.id)} disabled={reject.isPending}>
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
