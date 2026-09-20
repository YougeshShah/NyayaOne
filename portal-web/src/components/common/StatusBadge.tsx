import Chip from "@mui/material/Chip";

const COLOR_MAP: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  ACTIVE: "success",
  PENDING_VERIFICATION: "warning",
  SUSPENDED: "error",
  INACTIVE: "default",
  OPEN: "info",
  ONGOING: "warning",
  ON_HOLD: "default",
  CLOSED: "success",
  DISMISSED: "error",
  SCHEDULED: "info",
  COMPLETED: "success",
  ADJOURNED: "warning",
  CANCELLED: "error",
};

export function StatusBadge({ status }: { status: string }) {
  return <Chip label={status.replace(/_/g, " ")} color={COLOR_MAP[status] || "default"} size="small" sx={{ fontWeight: 600 }} />;
}
