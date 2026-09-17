import React, { useEffect, useState } from "react";
import {
  Alert,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from "@mui/material";
import api, { errorMessage } from "../api/api";

function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [editingContractId, setEditingContractId] = useState(null);

  const [form, setForm] = useState({
    vendorId: "",
    contractTitle: "",
    startDate: "",
    endDate: "",
    contractValue: "",
    paymentTerms: "",
    status: "",
  });

  useEffect(() => {
    let ignore = false;
    api.get("/contracts").then(response => {
      if (!ignore) setContracts(response.data);
    }).catch(err => { if (!ignore) setError(errorMessage(err)); });
    api.get("/vendors").then(response => { if (!ignore) setVendors(response.data); }).catch(err => { if (!ignore) setError(errorMessage(err)); });
    return () => { ignore = true; };
  }, []);

  const filteredContracts = contracts.filter((contract) =>
    (contract.contractTitle || "").toLowerCase().includes(search.toLowerCase()) ||
    (contract.status || "").toLowerCase().includes(search.toLowerCase()) ||
    (contract.vendor?.companyName || "").toLowerCase().includes(search.toLowerCase())
  );

  const fetchContracts = async () => {
    const response = await api.get("/contracts");
    setContracts(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      vendorId: "",
      contractTitle: "",
      startDate: "",
      endDate: "",
      contractValue: "",
      paymentTerms: "",
      status: "",
    });
    setEditingContractId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.vendorId || !form.contractTitle.trim()) {
      setError("Select a vendor and enter a contract title");
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError("End date must be on or after start date");
      return;
    }
    if (form.contractValue !== "" && (!Number.isFinite(Number(form.contractValue)) || Number(form.contractValue) < 0)) {
      setError("Contract value must be a non-negative number");
      return;
    }
    setSaving(true);
    const payload = {
      contractTitle: form.contractTitle,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      contractValue: form.contractValue === "" ? null : form.contractValue,
      paymentTerms: form.paymentTerms,
      status: form.status,
    };

    try {
      if (editingContractId) {
        await api.put(`/contracts/${editingContractId}/vendor/${form.vendorId}`, payload);
      } else {
        await api.post(`/contracts/vendor/${form.vendorId}`, payload);
      }

      resetForm();
      await fetchContracts();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contract? This cannot be undone.")) return;
    setError("");
    try {
      await api.delete(`/contracts/${id}`);
      if (editingContractId === id) resetForm();
      await fetchContracts();
    } catch (error) {
      setError(errorMessage(error));
    }
  };

  const handleEdit = (contract) => {
    setForm({
      vendorId: contract.vendor?.id || "",
      contractTitle: contract.contractTitle || "",
      startDate: contract.startDate || "",
      endDate: contract.endDate || "",
      contractValue: contract.contractValue ?? "",
      paymentTerms: contract.paymentTerms || "",
      status: contract.status || "",
    });
    setEditingContractId(contract.id);
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
          background: "linear-gradient(135deg, #00838f, #26c6da)",
          boxShadow: "0 10px 24px rgba(0,131,143,0.25)",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Contract Management
        </Typography>
        <Typography variant="body1">
          Track contract dates, values, payment terms, and linked vendors.
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
          {editingContractId ? "Edit Contract" : "Add Contract"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              select
              label="Select Vendor"
              required
              name="vendorId"
              value={form.vendorId}
              onChange={handleChange}
              fullWidth
            >
              {vendors.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.companyName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Contract Title"
              required
              name="contractTitle"
              value={form.contractTitle}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              type="date"
              label="Start Date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              type="date"
              label="End Date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Contract Value"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              name="contractValue"
              value={form.contractValue}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Payment Terms"
              name="paymentTerms"
              value={form.paymentTerms}
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
                {editingContractId ? "Update Contract" : "Add Contract"}
              </Button>

              {editingContractId && (
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
          label="Search by title, status, or vendor"
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
              <TableCell>Title</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Payment Terms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id}</TableCell>
                <TableCell>{contract.contractTitle}</TableCell>
                <TableCell>{contract.startDate}</TableCell>
                <TableCell>{contract.endDate}</TableCell>
                <TableCell>{contract.contractValue}</TableCell>
                <TableCell>{contract.paymentTerms}</TableCell>
                <TableCell>{contract.status}</TableCell>
                <TableCell>{contract.vendor?.companyName || "N/A"}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => handleEdit(contract)}>
                      Edit
                    </Button>
                    <Button color="error" onClick={() => handleDelete(contract.id)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {filteredContracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No contracts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default ContractsPage;