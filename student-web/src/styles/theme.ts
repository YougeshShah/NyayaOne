import { createTheme } from "@mui/material/styles";

/**
 * Distinct palette from Company Web / Law Firm Web (which use a formal navy
 * "admin tool" look) — Student Web is consumer-facing, so a friendlier,
 * more energetic color works better for an exam-prep/learning app.
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: "#2563EB",
      light: "#60A5FA",
      dark: "#1E40AF",
    },
    secondary: {
      main: "#F59E0B",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    success: { main: "#16A34A" },
    error: { main: "#DC2626" },
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans Devanagari", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});
