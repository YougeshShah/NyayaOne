import { createTheme } from "@mui/material/styles";

/**
 * Central MUI theme for the Company Control Center.
 * Keeping theme definition separate from components so design tokens
 * (colors, typography) can be updated in one place across the whole app.
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: "#1E3A5F",
      light: "#2E5C8A",
      dark: "#12233A",
    },
    secondary: {
      main: "#B8860B",
    },
    background: {
      default: "#F4F6F8",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans Devanagari", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});
