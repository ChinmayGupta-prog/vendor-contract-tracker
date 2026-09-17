import React, { useEffect, useState } from "react";
import {
  Alert,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  MenuItem,
} from "@mui/material";
import api, { errorMessage } from "../api/api";

function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    category: "",
    city: "",
    status: "",
  });

  const [search, setSearch] = useState("");

  const [editingVendorId, setEditingVendorId] = useState(null);

  useEffect(() => {
    let ignore = false;
    api.get("/vendors").then(response => {
      if (!ignore) setVendors(response.data);
    }).catch(err => { if (!ignore) setError(errorMessage(err)); });
    return () => { ignore = true; };
  }, []);

  const filteredVendors = vendors.filter((vendor) =>
    (vendor.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
    (vendor.city || "").toLowerCase().includes(search.toLowerCase()) ||
    (vendor.category || "").toLowerCase().includes(search.toLowerCase()) ||
    (vendor.status || "").toLowerCase().includes(search.toLowerCase())
  );

  const fetchVendors = async () => {
    const response = await api.get("/vendors");
    setVendors(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      category: "",
      city: "",
      status: "",
    });
    setEditingVendorId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    setSaving(true);

    try {
      if (editingVendorId) {
        await api.put(`/vendors/${editingVendorId}`, form);
      } else {
        await api.post("/vendors", form);
      }

      resetForm();
      await fetchVendors();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor and all its contracts? This cannot be undone.")) return;
    setError("");
    try {
      await api.delete(`/vendors/${id}`);
      if (editingVendorId === id) resetForm();
      await fetchVendors();
    } catch (error) {
      setError(errorMessage(error));
    }
  };

  const handleEdit = (vendor) => {
    setForm({
      companyName: vendor.companyName || "",
      contactPerson: vendor.contactPerson || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      category: vendor.category || "",
      city: vendor.city || "",
      status: vendor.status || "",
    });
    setEditingVendorId(vendor.id);
  };

  return (
    <Container sx={{ mt: 5, mb: 5 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          color: "white",
          background: "linear-gradient(135deg, #1565c0, #42a5f5)",
          boxShadow: "0 10px 24px rgba(21,101,192,0.25)",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Vendor Management
        </Typography>

      </Paper>

      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {editingVendorId ? "Edit Vendor" : "Add Vendor"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Company Name"
              required
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" size="large" disabled={saving}>
                {editingVendorId ? "Update Vendor" : "Add Vendor"}
              </Button>

              {editingVendorId && (
                <Button variant="outlined" color="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(6px)",
        }}
      >
        <TextField
          label="Search by company, city, category, or status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </Paper>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.id}</TableCell>
                <TableCell>{vendor.companyName}</TableCell>
                <TableCell>{vendor.contactPerson}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phone}</TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell>{vendor.city}</TableCell>
                <TableCell>{vendor.status}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => handleEdit(vendor)}>
                      Edit
                    </Button>
                    <Button color="error" onClick={() => handleDelete(vendor.id)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {filteredVendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No vendors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default VendorsPage;