import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#26c6da",
    },
    background: {
      default: "#f5f9ff",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

export default theme;