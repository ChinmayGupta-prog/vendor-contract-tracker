import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import VendorsPage from "./pages/VendorsPage";
import ContractsPage from "./pages/ContractsPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;