import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Box,
  Typography,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { studentService } from "../services/studentService";

const StudentSelectionDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Chọn sinh viên",
  multiSelect = false,
  eventId = null,
  excludeRegistered = false,
}) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let studentsData;

      if (excludeRegistered && eventId) {
        // Lấy danh sách sinh viên chưa đăng ký event này
        studentsData = await studentService.getStudentsNotInEvent(eventId);
      } else {
        // Lấy tất cả sinh viên
        studentsData = await studentService.getAllStudents();
      }

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Không thể tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  }, [eventId, excludeRegistered]);

  const filterStudents = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        (student.student_code || student.studentCode)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (student.name || student.fullName)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  useEffect(() => {
    if (open) {
      fetchStudents();
      setSelectedStudents([]);
      setSearchTerm("");
    }
  }, [open, fetchStudents]);

  useEffect(() => {
    filterStudents();
  }, [filterStudents]);

  const handleStudentToggle = (student) => {
    const studentId = student.student_id || student.id;

    if (multiSelect) {
      setSelectedStudents((prev) => {
        const isSelected = prev.find(
          (s) => (s.student_id || s.id) === studentId
        );
        if (isSelected) {
          return prev.filter((s) => (s.student_id || s.id) !== studentId);
        } else {
          return [...prev, student];
        }
      });
    } else {
      setSelectedStudents([student]);
    }
  };

  const handleConfirm = () => {
    if (selectedStudents.length === 0) {
      setError("Vui lòng chọn ít nhất một sinh viên");
      return;
    }

    onConfirm(multiSelect ? selectedStudents : selectedStudents[0]);
    onClose();
  };

  const isStudentSelected = (student) => {
    const studentId = student.student_id || student.id;
    return (
      selectedStudents.find((s) => (s.student_id || s.id) === studentId) !==
      undefined
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: "80vh" },
      }}
    >
      <DialogTitle>
        {title}
        {multiSelect && (
          <Typography variant="caption" display="block" color="text.secondary">
            {selectedStudents.length > 0
              ? `Đã chọn ${selectedStudents.length} sinh viên`
              : "Chọn nhiều sinh viên bằng cách tích vào checkbox"}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã sinh viên hoặc tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: "400px", overflow: "auto" }}>
            {filteredStudents.length === 0 ? (
              <ListItem key="no-students">
                <ListItemText
                  primary="Không tìm thấy sinh viên nào"
                  secondary={
                    searchTerm
                      ? "Thử thay đổi từ khóa tìm kiếm"
                      : "Danh sách trống"
                  }
                />
              </ListItem>
            ) : (
              filteredStudents.map((student) => (
                <ListItem key={student.student_id || student.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleStudentToggle(student)}
                    selected={isStudentSelected(student)}
                  >
                    {multiSelect && (
                      <ListItemIcon>
                        <Checkbox
                          checked={isStudentSelected(student)}
                          onChange={() => handleStudentToggle(student)}
                        />
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="span">
                          {student.name || student.fullName}
                          <Typography
                            variant="body2"
                            color="primary"
                            component="span"
                            sx={{ ml: 1, fontWeight: "bold" }}
                          >
                            ({student.student_code || student.studentCode})
                          </Typography>
                        </Typography>
                      }
                      secondary={student.email}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedStudents.length === 0}
        >
          {multiSelect
            ? `Thêm ${selectedStudents.length} sinh viên`
            : "Thêm sinh viên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentSelectionDialog;
