// StudentInEvent API service
export const getStudentsByEvent = async (eventId) => {
  console.log("🔄 API Call: getStudentsByEvent with eventId:", eventId);
  const res = await fetch(`/api/StudentInEvent/by-event/${eventId}`);
  console.log("📡 API Response status:", res.status);

  if (!res.ok) {
    const errorData = await res.json();
    console.error("❌ API Error:", errorData);
    throw errorData;
  }

  const data = await res.json();
  console.log("✅ API Success data:", data);
  return data;
};

export const getEventsByStudent = async (studentId) => {
  const token = localStorage.getItem("authToken");
  console.log("Making request to:", `/api/registration/by-student/${studentId}`);
  console.log("Using token:", token ? "Token exists" : "No token");
  
  const res = await fetch(`/api/registration/by-student/${studentId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  
  console.log("Events response status:", res.status);
  console.log("Events response ok:", res.ok);
  
  if (!res.ok) {
    const error = await res.json();
    console.error("Events API Error:", error);
    throw error;
  }
  
  const data = await res.json();
  console.log("Events data received:", data);
  return data;
};

export const getEventsByUser = async (userId) => {
  const res = await fetch(`/api/registration/by-user/${userId}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

// Student self-registration for events
export const registerStudentForEvent = async (eventId, studentCode, token) => {
  try {
    const requestBody = {
      EventId: eventId,
      StudentCode: studentCode,
    };

    console.log("[StudentInEventService] Registration request:", {
      url: "/api/registration/register",
      method: "POST",
      body: requestBody,
      hasToken: !!token,
    });

    const res = await fetch("/api/registration/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    if (res.ok) {
      return res.json();
    }

    // Handle specific error cases
    if (res.status === 409) {
      // Student already registered - treat as success
      const errorData = await res.json().catch(() => ({}));
      if (
        errorData.message &&
        errorData.message.includes("already registered")
      ) {
        return { message: "Student is already registered", success: true };
      }
    }

    // Handle other errors
    let errMsg = "Lỗi không xác định!";
    try {
      const errorData = await res.json();
      errMsg = errorData.message || errorData.title || "Đăng ký thất bại";

      // If student not found, try to create student first
      if (
        errMsg.includes("not found") &&
        errMsg.includes("Student with code")
      ) {
        await createStudentIfNotExists(studentCode, token);
        // Retry registration after creating student
        return await registerStudentForEvent(eventId, studentCode, token);
      }
    } catch (parseError) {
      console.warn("Could not parse error response:", parseError);
      errMsg = `Đăng ký thất bại (${res.status})`;
    }
    throw { message: errMsg };
  } catch (error) {
    if (error.message) throw error;
    throw { message: "Lỗi kết nối mạng" };
  }
};

// Helper function to create student if not exists
const createStudentIfNotExists = async (studentCode, token) => {
  try {
    const res = await fetch("/api/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        Name: studentCode, // Use studentCode as name fallback
        StudentCode: studentCode,
        Email: `${studentCode}@student.edu.vn`, // Generate email fallback
        Phone: null,
        UniversityId: null, // Will be set later if needed
      }),
    });

    if (!res.ok) {
      throw new Error("Không thể tạo student record");
    }
    return res.json();
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

// Check if student is already registered for event
export const checkStudentRegistration = async (eventId, studentCode, token) => {
  try {
    // Use endpoint that gets all registrations for a student
    const res = await fetch(
      `/api/registration/by-student-code/${studentCode}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (res.ok) {
      const registrations = await res.json();
      // Check if any registration has matching eventId
      return registrations.some(
        (reg) => reg.eventId === eventId || reg.EventId === eventId
      );
    }

    // If 404, student has no registrations
    if (res.status === 404) {
      return false;
    }

    // For other errors, assume not registered
    return false;
  } catch (error) {
    console.error("Error checking registration:", error);
    return false;
  }
};

export const addStudentToEvent = async (data, token) => {
  const res = await fetch("/api/StudentInEvent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let errMsg = "Lỗi không xác định!";
    try {
      errMsg = await res.text();
    } catch {}
    throw { message: errMsg };
  }
  return res.json();
};

export const addMultipleStudentsToEvent = async (data, token) => {
  const res = await fetch("/api/StudentInEvent/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let errMsg = "Lỗi không xác định!";
    try {
      errMsg = await res.text();
    } catch {}
    throw { message: errMsg };
  }
  return res.json();
};

export const updateStudentStatus = async (studentInEventId, status, token) => {
  const res = await fetch(`/api/StudentInEvent/${studentInEventId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    let errMsg = "Lỗi không xác định!";
    try {
      errMsg = await res.text();
    } catch {}
    throw { message: errMsg };
  }
  return res.json();
};

export const removeStudentFromEvent = async (studentInEventId, token) => {
  const res = await fetch(`/api/StudentInEvent/${studentInEventId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let errMsg = "Lỗi không xác định!";
    try {
      errMsg = await res.text();
    } catch {}
    throw { message: errMsg };
  }
  return res.json();
};

export const importStudentsFromCsv = async (eventId, csvFile, token) => {
  const formData = new FormData();
  formData.append("csvFile", csvFile);

  const res = await fetch(`/api/StudentInEvent/import-csv/${eventId}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    let errMsg = "Lỗi không xác định!";
    try {
      errMsg = await res.text();
    } catch {}
    throw { message: errMsg };
  }
  return res.json();
};

export const cancelRegistration = async (registrationId, token) => {
  const res = await fetch(`/api/registration/${registrationId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    let errMsg = "Lỗi khi hủy đăng ký!";
    try {
      const errorData = await res.json();
      errMsg = errorData.message || errorData.title || "Hủy đăng ký thất bại";
    } catch (error) {
      console.error("Error parsing response:", error);
    }
    throw { message: errMsg };
  }
  return true; // Success
};

// Legacy methods for backward compatibility
export const getStudentInEvents = async () => {
  const res = await fetch("/api/registration");
  if (!res.ok) throw await res.json();
  return res.json();
};

export const addStudentInEvent = async (data) => {
  const res = await fetch("/api/registration/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
