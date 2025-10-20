import { getStudentId } from "../utils/authUtils";
import { getEventsByStudent } from "./studentInEventService";
import { useAuth } from "../contexts/AuthContext";

// Lấy trạng thái điểm danh của sinh viên trong một phiên
export const getStudentCheckInStatus = async (sessionId) => {
  try {
    const studentId = getStudentId();
    console.log("Retrieved studentId:", studentId);

    if (!studentId) {
      console.error("No student ID found using getStudentId()");
      return false;
    }

    // Lấy thông tin check-in của phiên
    const checkIns = await getCheckInsBySession(sessionId);
    console.log(`Checking session ${sessionId} check-ins:`, checkIns);
    console.log("Number of check-ins found:", checkIns.length);

    // Tìm check-in của sinh viên hiện tại trong phiên
    const hasCheckedIn = checkIns.some((checkIn) => {
      // Log chi tiết hơn để debug
      console.log("Checking check-in details:", {
        checkIn: checkIn,
        checkInStudentId: checkIn.studentId,
        checkInStudentInEventId: checkIn.studentInEventId,
        currentStudentId: studentId,
        studentInEvent: checkIn.studentInEvent,
        studentInEventDetails: checkIn.studentInEvent
          ? {
              id: checkIn.studentInEvent.id,
              studentId: checkIn.studentInEvent.studentId,
              eventId: checkIn.studentInEvent.eventId,
            }
          : null,
      });

      // Kiểm tra tất cả các trường có thể chứa studentId
      const matched =
        checkIn.studentId === studentId ||
        (checkIn.studentInEvent &&
          checkIn.studentInEvent.studentId === studentId) ||
        checkIn.studentInEventId === studentId ||
        (checkIn.studentInEvent &&
          checkIn.studentInEvent.id === checkIn.studentInEventId);

      console.log("Check-in match result:", matched);
      return matched;
    });

    console.log(
      "Final check-in status for session:",
      sessionId,
      "is:",
      hasCheckedIn
    );
    return hasCheckedIn;
  } catch (error) {
    console.error("Error checking attendance status:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return false;
  }
};

// Gọi API backend cho SessionCheckIn
export const getCheckIns = async () => {
  console.log("Getting all check-ins...");
  const token = localStorage.getItem("authToken");
  console.log("Using auth token:", token ? "Token exists" : "No token found");
  
  try {
    const res = await fetch("/api/CheckIn", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    console.log("Check-ins API response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", errorData);
      throw errorData;
    }

    const data = await res.json();
    console.log("Check-ins data received:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch check-ins:", error);
    throw error;
  }
};

export const getCheckInsBySession = async (sessionId) => {
  const token = localStorage.getItem("authToken");
  console.log("Fetching check-ins for session:", sessionId);

  const res = await fetch(`/api/checkin/by-session/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.error("Error fetching check-ins:", res.status);
    throw await res.json();
  }

  const data = await res.json();
  console.log("Raw check-in data received:", data);
  return data;
};

export const getCheckInsByStudent = async (studentId) => {
  const token = localStorage.getItem("authToken");
  console.log("Making request to:", `/api/checkin/by-student/${studentId}`);
  console.log("Using token:", token ? "Token exists" : "No token");

  const res = await fetch(`/api/checkin/by-student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("Response status:", res.status);
  console.log("Response ok:", res.ok);

  if (!res.ok) {
    const error = await res.json();
    console.error("API Error:", error);
    throw error;
  }

  const data = await res.json();
  console.log("Check-ins data received:", data);
  return data;
};

export const addCheckIn = async (data) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch("/api/checkin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const checkInApi = async (qrDto) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch("/api/checkin/qr-checkin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(qrDto),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
