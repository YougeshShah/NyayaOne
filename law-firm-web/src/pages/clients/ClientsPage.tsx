import { useState } from "react";
import {
  Box,
  Button,
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
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import PhonelinkLockIcon from "@mui/icons-material/PhonelinkLockOutlined";
import { useForm } from "react-hook-form";
import { useClients, useCreateClient, useUpdateClient, useInviteClient, useDeleteClient } from "../../hooks/useClients";
import { PasswordField } from "../../components/common/PasswordField";
import { Client, CreateClientPayload } from "../../types/client.types";

export function ClientsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [invitingClient, setInvitingClient] = useState<Client | null>(null);
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useClients({ search: search || undefined, page: 1 });
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const handleDelete = (client: Client) => {
    if (window.confirm(`Delete ${client.fullName}? This cannot be undone.`)) {
      deleteClient.mutate(client.id);
    }
  };
  const inviteClient = useInviteClient();

  const { register, handleSubmit, reset, formState } = useForm<CreateClientPayload>();

  const openCreateDialog = () => {
    setEditingClient(null);
    reset({ fullName: "", fullNameNepali: "", phone: "", email: "", address: "", identificationType: "", identificationNo: "", notes: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    reset({
      fullName: client.fullName,
      fullNameNepali: client.fullNameNepali || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      identificationType: client.identificationType || "",
      identificationNo: client.identificationNo || "",
      notes: client.notes || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: CreateClientPayload) => {
    if (editingClient) {
      updateClient.mutate({ id: editingClient.id, payload: values }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createClient.mutate(values, {
        onSuccess: () => {
          reset();
          setDialogOpen(false);
        },
      });
    }
  };

  const openInviteDialog = (client: Client) => {
    setInvitingClient(client);
    setInvitePassword("");
    setInviteResult(null);
  };

  const submitInvite = () => {
    if (!invitingClient || invitePassword.length < 8) return;
    inviteClient.mutate(
      { id: invitingClient.id, password: invitePassword },
      {
        onSuccess: () => setInviteResult(`Portal access granted. Email: ${invitingClient.email} — share the password securely.`),
        onError: (err: any) => setInviteResult(err?.response?.data?.message || "Failed to grant access."),
      }
    );
  };

  const isSaving = createClient.isPending || updateClient.isPending;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Clients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} clients
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Client
        </Button>
      </Box>

      <TextField
        label="Search by name, phone, or email"
        size="small"
        fullWidth
        sx={{ mb: 3, maxWidth: 400 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="center">Cases</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No clients yet
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((client) => (
              <TableRow key={client.id} hover>
                <TableCell>{client.fullName}</TableCell>
                <TableCell>{client.phone || "—"}</TableCell>
                <TableCell>{client.email || "—"}</TableCell>
                <TableCell>{client.address || "—"}</TableCell>
                <TableCell align="center">{client._count?.cases ?? 0}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEditDialog(client)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PhonelinkLockIcon fontSize="small" />}
                    onClick={() => openInviteDialog(client)}
                    disabled={!client.email}
                    title={!client.email ? "Add an email first" : "Grant mobile app access"}
                  >
                    App Access
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(client)}
                    disabled={!!client._count?.cases || deleteClient.isPending}
                    title={client._count?.cases ? "Remove from cases first" : "Delete client"}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Full Name" required fullWidth {...register("fullName", { required: true })} error={!!formState.errors.fullName} />
            <TextField
              label="Full Name (Nepali)"
              fullWidth
              helperText="Used in generated legal documents when filled in — falls back to the English name otherwise"
              {...register("fullNameNepali")}
            />
            <TextField label="Phone" fullWidth {...register("phone")} />
            <TextField label="Email" fullWidth helperText="Required if you want to grant mobile app access later" {...register("email")} />
            <TextField label="Address" fullWidth {...register("address")} />
            <TextField label="Identification Type (e.g. Citizenship)" fullWidth {...register("identificationType")} />
            <TextField label="Identification No." fullWidth {...register("identificationNo")} />
            <TextField label="Notes" fullWidth multiline rows={2} {...register("notes")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? "Saving..." : editingClient ? "Save Changes" : "Save Client"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* GRANT APP ACCESS DIALOG */}
      <Dialog open={!!invitingClient} onClose={() => setInvitingClient(null)} fullWidth maxWidth="xs">
        <DialogTitle>Grant Mobile App Access</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {invitingClient?.fullName} will be able to log in to the NyayaOne Client App using their email ({invitingClient?.email}) and this password.
          </Typography>
          {inviteResult && <Alert severity={inviteResult.startsWith("Portal") ? "success" : "error"}>{inviteResult}</Alert>}
          <PasswordField
            label="Set Password"
            required
            fullWidth
            value={invitePassword}
            onChange={(e: any) => setInvitePassword(e.target.value)}
            helperText="Minimum 8 characters"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setInvitingClient(null)}>Close</Button>
          <Button variant="contained" onClick={submitInvite} disabled={inviteClient.isPending || invitePassword.length < 8}>
            {inviteClient.isPending ? "Granting..." : "Grant Access"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
