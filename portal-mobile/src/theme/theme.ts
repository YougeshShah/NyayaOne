export const colors = {
  primary: "#0F4C3A",
  primaryLight: "#1D6E52",
  primaryDark: "#0A3327",
  accent: "#B8860B",
  background: "#F4F6F8",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  success: "#2E7D32",
  warning: "#B8860B",
  error: "#C62828",
  info: "#1976D2",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const statusColor: Record<string, string> = {
  ACTIVE: colors.success,
  PENDING: colors.warning,
  PENDING_VERIFICATION: colors.warning,
  SUSPENDED: colors.error,
  OPEN: colors.info,
  ONGOING: colors.warning,
  ON_HOLD: colors.textSecondary,
  CLOSED: colors.success,
  DISMISSED: colors.error,
  SCHEDULED: colors.info,
  COMPLETED: colors.success,
  ADJOURNED: colors.warning,
  CANCELLED: colors.error,
};

export const priorityColor: Record<string, string> = {
  LOW: colors.success,
  MEDIUM: colors.info,
  HIGH: colors.warning,
  URGENT: colors.error,
};
