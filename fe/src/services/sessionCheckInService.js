
// Gọi API backend cho SessionCheckIn
export const getCheckIns = async () => {
  const token = localStorage.getItem("authToken");
  const res = await fetch("/api/checkin", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getCheckInsBySession = async (sessionId) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/checkin/by-session/${sessionId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getCheckInsByStudent = async (studentId) => {
  const token = localStorage.getItem("authToken");
  console.log("Making request to:", `/api/checkin/by-student/${studentId}`);
  console.log("Using token:", token ? "Token exists" : "No token");
  
  const res = await fetch(`/api/checkin/by-student/${studentId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
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
      "Authorization": `Bearer ${token}`
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
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(qrDto),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
