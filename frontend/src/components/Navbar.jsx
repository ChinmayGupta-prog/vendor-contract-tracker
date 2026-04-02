import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navButtonStyle = (path) => ({
    color: "white",
    fontWeight: location.pathname === path ? "bold" : "normal",
    borderBottom: location.pathname === path ? "2px solid white" : "none",
    borderRadius: 0,
    mx: 0.5,
  });

  return (
    <AppBar
      position="sticky"
      elevation={4}
      sx={{
        background: "linear-gradient(90deg, #1565c0, #1976d2, #26c6da)",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Vendor Contract Tracker
        </Typography>

        <Button component={Link} to="/" sx={navButtonStyle("/")}>
          Dashboard
        </Button>
        <Button component={Link} to="/vendors" sx={navButtonStyle("/vendors")}>
          Vendors
        </Button>
        <Button component={Link} to="/contracts" sx={navButtonStyle("/contracts")}>
          Contracts
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;