import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Stack, Box, Alert } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import api, { errorMessage } from "../api/api";

function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([api.get("/vendors"), api.get("/contracts")])
      .then(([vendors, contracts]) => {
        if (!ignore) setData({
          totalVendors: vendors.data.length,
          totalContracts: contracts.data.length,
          activeContracts: contracts.data.filter(contract => contract.status?.toLowerCase() === "active").length,
        });
      })
      .catch(err => { if (!ignore) setError(errorMessage(err)); });
    return () => { ignore = true; };
  }, []);

  return (
    <Container sx={{ mt: 5, mb: 5 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!data && !error && <Typography role="status">Loading dashboard?</Typography>}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          color: "white",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1976d2, #42a5f5, #26c6da)",
          boxShadow: "0 12px 30px rgba(25, 118, 210, 0.25)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            top: -60,
            right: -60,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
            bottom: -30,
            right: 120,
          }}
        />

        <Typography variant="h3" gutterBottom>
          Vendor Contract Tracker
        </Typography>

      </Paper>

      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Stack spacing={3}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <BusinessOutlinedIcon sx={{ fontSize: 42, color: "#1976d2" }} />
          <Box>
            <Typography variant="h6">Total Vendors</Typography>
            <Typography variant="h4">{data?.totalVendors ?? "?"}</Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 42, color: "#1976d2" }} />
          <Box>
            <Typography variant="h6">Total Contracts</Typography>
            <Typography variant="h4">{data?.totalContracts ?? "?"}</Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 42, color: "#1976d2" }} />
          <Box>
            <Typography variant="h6">Active Contracts</Typography>
            <Typography variant="h4">{data?.activeContracts ?? "?"}</Typography>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}

export default DashboardPage;