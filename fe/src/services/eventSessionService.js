// Gọi API backend cho EventSession
export const getEventSessions = async (event_id) => {
  if (!event_id || event_id === "undefined") {
    throw new Error("Event ID is required");
  }

  console.log(`🔄 Calling API: /api/EventSession/by-event/${event_id}`);

  try {
    const res = await fetch(`/api/EventSession/by-event/${event_id}`);
    console.log(`📡 API Response status: ${res.status}`);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`❌ API Error for eventId ${event_id}:`, errorData);
      throw errorData;
    }

    const data = await res.json();
    console.log(`✅ API Success for eventId ${event_id}:`, data);
    return data;
  } catch (error) {
    console.error(`🚨 Network/Parse error for eventId ${event_id}:`, error);
    throw error;
  }
};

export const getSessions = async () => {
  const res = await fetch(`/api/EventSession`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getSession = async (id) => {
  const res = await fetch(`/api/EventSession/${id}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getSessionsByEvent = async (eventId) => {
  if (!eventId || eventId === "undefined") {
    throw new Error("Event ID is required");
  }

  const res = await fetch(`/api/EventSession/by-event/${eventId}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const addSession = async (data) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/EventSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: `HTTP ${res.status}` }));
    throw errorData;
  }

  return res.json();
};

export const updateSession = async (id, data) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/EventSession/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: `HTTP ${res.status}` }));
    throw errorData;
  }

  return res.json();
};

export const deleteSession = async (id) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/EventSession/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok && res.status !== 204) throw await res.json();
  return true;
};
