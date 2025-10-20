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
