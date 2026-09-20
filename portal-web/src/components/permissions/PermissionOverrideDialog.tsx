import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUserPermissions, useSetPermissionOverride, useRemovePermissionOverride } from "../../hooks/useUserPermissions";

interface PermissionOverrideDialogProps {
  userId: string | null;
  onClose: () => void;
}

export function PermissionOverrideDialog({ userId, onClose }: PermissionOverrideDialogProps) {
  const { data, isLoading } = useUserPermissions(userId ?? undefined);
  const setOverride = useSetPermissionOverride(userId ?? undefined);
  const removeOverride = useRemovePermissionOverride(userId ?? undefined);

  const grouped = data?.permissions.reduce((acc: Record<string, typeof data.permissions>, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <Dialog open={!!userId} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Individual Permissions — {data?.userFullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Role: {data?.roleName ?? "None assigned"}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          "From Role" permissions come from this person's assigned role — shared with everyone else who has that
          role. Use Grant/Revoke below to give this specific person one extra permission their role doesn't
          include, or to take one away without affecting anyone else on the same role.
        </Typography>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {grouped &&
          Object.entries(grouped).map(([module, perms]) => (
            <Box key={module} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                {module}
              </Typography>
              {perms.map((p) => (
                <Box
                  key={p.permissionId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  <Box>
                    <Typography variant="body2">{p.key}</Typography>
                    {p.description && (
                      <Typography variant="caption" color="text.secondary">
                        {p.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {p.fromRole && <Chip label="From Role" size="small" variant="outlined" />}
                    {p.override === "GRANT" && <Chip label="+ Individually Granted" size="small" color="success" />}
                    {p.override === "REVOKE" && <Chip label="− Individually Revoked" size="small" color="error" />}

                    {p.override ? (
                      <Button size="small" onClick={() => removeOverride.mutate(p.permissionId)} disabled={removeOverride.isPending}>
                        Reset
                      </Button>
                    ) : (
                      <>
                        {!p.fromRole && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => setOverride.mutate({ permissionId: p.permissionId, granted: true })}
                            disabled={setOverride.isPending}
                          >
                            Grant
                          </Button>
                        )}
                        {p.fromRole && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setOverride.mutate({ permissionId: p.permissionId, granted: false })}
                            disabled={setOverride.isPending}
                          >
                            Revoke
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
      </DialogContent>
    </Dialog>
  );
}
