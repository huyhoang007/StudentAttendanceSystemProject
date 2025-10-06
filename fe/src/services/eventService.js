// Gọi API backend cho Event
export const getEvents = async () => {
  const res = await fetch("/api/event");
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getEventsByUniversity = async (universityId) => {
  const res = await fetch(`/api/event/by-university/${universityId}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getEventById = async (id) => {
  const res = await fetch(`/api/event/${id}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getEvent = async (id) => {
  const res = await fetch(`/api/event/${id}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const addEvent = async (data, token) => {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  console.log("Headers gửi lên:", headers); // Log kiểm tra headers
  const res = await fetch("/api/event", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let errMsg = "Lỗi không xác định!";
    try {
      errMsg = await res.text();
    } catch (e) {
      console.error("Error parsing error response:", e);
    }
    throw { message: errMsg };
  }
  return res.json();
};

export const updateEvent = async (id, data, token) => {
  const res = await fetch(`/api/event/${id}`, {
    method: "PUT",
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
    } catch (e) {
      console.error("Error parsing error response:", e);
    }
    throw { message: errMsg };
  }
  return res.json();
};

export const deleteEvent = async (id, token) => {
  const res = await fetch(`/api/event/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let errMsg = "Lỗi không xác định!";
    try {
      errMsg = await res.text();
    } catch (e) {
      console.error("Error parsing error response:", e);
    }
    throw { message: errMsg };
  }

  // Delete usually returns 204 No Content, no need to parse JSON
  if (res.status === 204) {
    return { success: true };
  }

  // If there's content, try to parse JSON
  try {
    return await res.json();
  } catch {
    // If JSON parsing fails, just return success
    return { success: true };
  }
};
