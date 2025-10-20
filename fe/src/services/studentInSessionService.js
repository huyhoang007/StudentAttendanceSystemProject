// Dịch vụ quản lý sinh viên trong các phiên học (điểm danh)
import { getStudentId } from "../utils/authUtils";

export const getStudentCheckInStatusBySessionId = async (sessionId) => {
  const studentId = getStudentId();
  if (!studentId) throw new Error("Chưa đăng nhập");
  const token = localStorage.getItem("authToken");
  console.log("getStudentCheckInStatusBySessionId", { sessionId, studentId, hasToken: !!token });

  const res = await fetch(
    `/api/CheckIn/check-status?sessionId=${sessionId}&studentId=${studentId}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    let err = null;
    try {
      err = await res.json();
    } catch (e) {
      console.error("Failed to parse error from check-status", e);
    }
    console.error("check-status API returned error", res.status, err);
    throw err || new Error(`check-status failed with ${res.status}`);
  }

  const data = await res.json();
  console.log("check-status response", data);
  return !!data.isCheckedIn;
};
