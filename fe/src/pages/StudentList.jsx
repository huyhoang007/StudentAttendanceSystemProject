import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Delete, Edit, UploadFile } from "@mui/icons-material";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  bulkInsert,
} from "../services/studentService";
import { parseCSV } from "../utils/csvParser";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    student_code: "",
    email: "",
    phone: "",
    university_id: 1,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getStudents();
    setStudents(data);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateStudent(editingId, form);
    } else {
      await addStudent(form);
    }
    setOpen(false);
    setEditingId(null);
    setForm({
      name: "",
      student_code: "",
      email: "",
      phone: "",
      university_id: 1,
    });
    fetchData();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      student_code: item.student_code,
      email: item.email,
      phone: item.phone,
      university_id: item.university_id,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete student?")) return;
    await deleteStudent(id);
    fetchData();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text); // returns array of objects, implement mapping
    // map CSV columns to student fields (basic)
    const mapped = rows.map((r) => ({
      name: r.name || `${r.firstName || r.fullName || "Unknown"}`,
      student_code: r.student_code || r.code || r.studentCode,
      email: r.email || "",
      phone: r.phone || "",
      university_id: r.university_id ? Number(r.university_id) : 1,
    }));
    await bulkInsert(mapped);
    fetchData();
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2}>
        Student Management
      </Typography>
      <Box mb={2} display="flex" gap={2}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add Student
        </Button>
        <label>
          <input
            type="file"
            accept=".csv,.xlsx"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadFile />}
          >
            Import CSV
          </Button>
        </label>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>University</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.student_code}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.university_id}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(s)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(s.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Student Code"
            fullWidth
            margin="dense"
            value={form.student_code}
            onChange={(e) => setForm({ ...form, student_code: e.target.value })}
          />
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="dense"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentList;
