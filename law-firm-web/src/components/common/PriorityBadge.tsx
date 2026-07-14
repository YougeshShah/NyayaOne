import Chip from "@mui/material/Chip";

const PRIORITY_COLOR_MAP: Record<string, "success" | "warning" | "error" | "info"> = {
  LOW: "success",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "error",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return <Chip label={priority} color={PRIORITY_COLOR_MAP[priority] || "info"} size="small" variant="outlined" />;
}
