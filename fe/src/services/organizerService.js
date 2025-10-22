// Gọi API backend cho Organizer
export const getOrganizerByUserId = async (userId) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/organizers/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getOrganizerById = async (organizerId) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/organizers/${organizerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateOrganizer = async (organizerId, updateData) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/organizers/${organizerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getOrganizers = async () => {
  const token = localStorage.getItem("authToken");
  const res = await fetch("/api/organizers", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("authToken");
  console.log("Sending profile update:", profileData); // Debug log

  try {
    const res = await fetch("/api/organizers/me/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    console.log("Response status:", res.status); // Debug log
    console.log("Response headers:", [...res.headers.entries()]); // Debug log

    // First get response as text
    const text = await res.text();
    console.log("Raw response:", text); // Debug log

    // Only try to parse as JSON if there's content
    if (!text) {
      console.log("Empty response body");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return null;
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(text);
      console.log("Parsed response:", data); // Debug log
    } catch (e) {
      console.error("JSON parse error:", e);
      throw new Error("Invalid JSON in response: " + text);
    }

    if (!res.ok) {
      let errorMessage = data?.message || "Failed to update profile";
      if (data?.errors) {
        errorMessage = Object.entries(data.errors)
          .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
          .join("; ");
      }
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};
