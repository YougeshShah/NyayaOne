import Chip from "@mui/material/Chip";

const STATUS_COLOR_MAP: Record<string, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  PENDING: "warning",
  SUSPENDED: "error",
  REJECTED: "default",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Chip label={status} color={STATUS_COLOR_MAP[status] || "default"} size="small" sx={{ fontWeight: 600 }} />;
}
