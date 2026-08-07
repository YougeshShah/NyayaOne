import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm } from "react-hook-form";
import { useRoles, usePermissionsList, useRolePermissionActions } from "../../hooks/useRolePermissions";
import { useAuthStore } from "../../store/authStore";
import { Permission } from "../../api/rolePermission.api";

export function RolesPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.roleName === "Super Admin";

  const { data: roles, isLoading } = useRoles();
  const rolesList = roles ?? [];
  const { data: permissions } = usePermissionsList();
  const { createRole, updatePermissions } = useRolePermissionActions();

  const [createOpen, setCreateOpen] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<{ name: string; description?: string }>();

  // Group permissions by module (LawFirm, Court, Library, ...) so the matrix
  // reads as sections instead of one long flat list.
  const grouped = (permissions ?? []).reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const togglePermission = (roleId: string, currentKeys: string[], permKey: string) => {
    const next = currentKeys.includes(permKey) ? currentKeys.filter((k) => k !== permKey) : [...currentKeys, permKey];
    updatePermissions.mutate({ roleId, permissionKeys: next });
  };

  const onCreateRole = (values: { name: string; description?: string }) => {
    createRole.mutate(values, {
      onSuccess: () => {
        reset();
        setCreateOpen(false);
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Roles &amp; Permissions
        </Typography>
        {isSuperAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Add Role
          </Button>
        )}
      </Box>

      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view the permission matrix, but only Super Admin can edit it — matching the principle that this is
          the highest-trust role and should stay in as few hands as possible.
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        "Super Admin" always has every permission by design and isn't editable here — check/uncheck boxes below to
        control exactly what each other role can do.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Permission</TableCell>
              {rolesList.map((role) => (
                <TableCell key={role.id} align="center" sx={{ fontWeight: 700, minWidth: 130 }}>
                  {role.name}
                  {role.isSystem && (
                    <Chip label="System" size="small" sx={{ ml: 0.5, height: 16, fontSize: 10 }} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={(rolesList.length ?? 0) + 1} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {Object.entries(grouped).map(([module, perms]) => (
              <>
                <TableRow key={`section-${module}`} sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell colSpan={(rolesList.length ?? 0) + 1} sx={{ fontWeight: 700, fontSize: 12, color: "text.secondary" }}>
                    {module}
                  </TableCell>
                </TableRow>
                {perms?.map((perm) => (
                  <TableRow key={perm.id} hover>
                    <TableCell>
                      <Typography variant="body2">{perm.key}</Typography>
                      {perm.description && (
                        <Typography variant="caption" color="text.secondary">
                          {perm.description}
                        </Typography>
                      )}
                    </TableCell>
                    {rolesList.map((role) => {
                      const isSuperAdminRole = role.name === "Super Admin";
                      return (
                        <TableCell key={role.id} align="center">
                          <Checkbox
                            checked={isSuperAdminRole || role.permissionKeys.includes(perm.key)}
                            disabled={isSuperAdminRole || !isSuperAdmin}
                            onChange={() => togglePermission(role.id, role.permissionKeys, perm.key)}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Role</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreateRole)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {createRole.isError && (
              <Alert severity="error">
                {(createRole.error as any)?.response?.data?.message || "Failed to create role"}
              </Alert>
            )}
            <TextField
              label="Role Name"
              required
              fullWidth
              {...register("name", { required: true })}
              error={!!formState.errors.name}
            />
            <TextField label="Description" fullWidth multiline rows={2} {...register("description")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createRole.isPending}>
              {createRole.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
