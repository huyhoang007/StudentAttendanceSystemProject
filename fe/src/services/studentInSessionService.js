// Dịch vụ quản lý sinh viên trong các phiên học (điểm danh)
import { getStudentId } from "../utils/authUtils";

export const getStudentCheckInStatusBySessionId = async (sessionId) => {
  const studentId = getStudentId();
  if (!studentId) throw new Error("Chưa đăng nhập");

  const res = await fetch(
    `/api/CheckIn/check-status?sessionId=${sessionId}&studentId=${studentId}`
  );
  if (!res.ok) throw await res.json();
  const data = await res.json();
  return data.isCheckedIn;
};
